import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Eye,
  Info,
  LoaderCircle,
  MessageSquare,
} from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { feedbackMotion } from "@/lib/motion-presets";
import { designClasses as ui } from "@/lib/design-system";

export type ContactValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
type ContactFormProps = { onSend?: (values: ContactValues) => Promise<void> };
const emptyValues: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

/** Without onSend, validates and previews the message without transmitting it. */
export function ContactForm({ onSend }: ContactFormProps) {
  const prefix = useId();
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactValues, string>>
  >({});
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);
  const [previewed, setPreviewed] = useState(false);
  const reduced = useReducedMotion();
  const id = (field: string) => `${prefix}-${field}`;
  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSendError("");
    setPreviewed(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    ) as ContactValues;
    const next: typeof errors = {};
    if (data.name.length < 2) next.name = "Укажите имя: минимум 2 символа.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      next.email = "Введите email, например hello@example.com.";
    if (data.message.length < 10)
      next.message = "Добавьте немного деталей: минимум 10 символов.";
    setErrors(next);
    if (Object.keys(next).length) {
      document
        .getElementById(
          id(next.name ? "name" : next.email ? "email" : "message"),
        )
        ?.focus();
      return;
    }
    setSendError("");
    setSent(false);
    if (onSend) {
      setPending(true);
      try {
        await onSend(data);
        setSent(true);
        setValues(emptyValues);
        setOpen(true);
      } catch {
        setSendError(
          "Не удалось отправить сообщение. Текст сохранён в форме — попробуйте ещё раз.",
        );
      } finally {
        setPending(false);
      }
    } else {
      setPreviewed(true);
      setValues(data);
      setOpen(true);
    }
  }
  const fieldClass =
    "h-auto min-h-12 w-full min-w-0 rounded-lg border-white/20 bg-[#10160f] px-3 py-3 text-base leading-6 text-[#edf1e7] placeholder:text-[#9da992] hover:border-white/35 focus-visible:border-[#d3ed9a] focus-visible:ring-[#d3ed9a]/25 aria-invalid:border-[#ffb4b0] aria-invalid:ring-[#ffb4b0]/20 dark:bg-[#10160f] dark:aria-invalid:border-[#ffb4b0] disabled:cursor-not-allowed disabled:opacity-50 md:text-base";
  return (
    <>
      <Card className="min-w-0 w-full gap-6 rounded-2xl border border-white/15 bg-[#171c17] py-6 text-[#edf1e7] shadow-none ring-0 sm:py-8">
        <CardHeader className="gap-3 border-b border-white/10 px-5 pb-6 sm:px-8">
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl border border-[#d3ed9a]/20 bg-[#d3ed9a]/10 text-[#d3ed9a]">
            <MessageSquare size={21} aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-medium tracking-tight">
            Расскажите о своей идее
          </CardTitle>
          <CardDescription className="text-base leading-7 text-[#b1bda7]">
            Идея, вопрос или предложение для LePear — расскажите, что у вас на
            уме.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 px-5 sm:px-8">
          <form
            onSubmit={submit}
            noValidate
            className="space-y-6"
            aria-label="Контактная форма"
            aria-busy={pending}
          >
            <fieldset
              disabled={pending}
              className="min-w-0 space-y-5 disabled:opacity-70"
            >
              <legend className="sr-only">Ваши контакты и сообщение</legend>
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <div className="min-w-0 space-y-2.5">
                  <Label htmlFor={id("name")} className="text-sm">
                    Имя <span className="text-[#b1bda7]">*</span>
                  </Label>
                  <Input
                    id={id("name")}
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Как к вам обращаться"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? id("name-error") : undefined
                    }
                    className={fieldClass}
                  />
                  {errors.name && (
                    <ContactFieldError
                      id={id("name-error")}
                      message={errors.name}
                    />
                  )}
                </div>
                <div className="min-w-0 space-y-2.5">
                  <Label htmlFor={id("email")} className="text-sm">
                    Email <span className="text-[#b1bda7]">*</span>
                  </Label>
                  <Input
                    id={id("email")}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? id("email-error") : undefined
                    }
                    className={fieldClass}
                  />
                  {errors.email && (
                    <ContactFieldError
                      id={id("email-error")}
                      message={errors.email}
                    />
                  )}
                </div>
              </div>
              <div className="min-w-0 space-y-2.5">
                <Label htmlFor={id("subject")} className="flex-wrap text-sm">
                  Тема{" "}
                  <span className="font-normal text-[#b1bda7]">
                    необязательно
                  </span>
                </Label>
                <Input
                  id={id("subject")}
                  name="subject"
                  value={values.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  maxLength={160}
                  placeholder="О чём хотите поговорить?"
                  className={fieldClass}
                />
              </div>
              <div className="min-w-0 space-y-2.5">
                <Label htmlFor={id("message")} className="text-sm">
                  Сообщение <span className="text-[#b1bda7]">*</span>
                </Label>
                <Textarea
                  id={id("message")}
                  name="message"
                  value={values.message}
                  onChange={(e) => update("message", e.target.value)}
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  placeholder="Расскажите подробнее…"
                  className={
                    fieldClass +
                    " h-48 min-h-40 max-w-full resize-y field-sizing-fixed leading-7"
                  }
                  aria-invalid={!!errors.message}
                  aria-describedby={`${id("message-hint")}${errors.message ? ` ${id("message-error")}` : ""}`}
                />
                <div
                  id={id("message-hint")}
                  className="flex flex-wrap justify-between gap-2 text-sm leading-6 text-[#b1bda7]"
                >
                  <span>От 10 до 3000 символов</span>
                  <span>{values.message.length}/3000</span>
                </div>
                {errors.message && (
                  <ContactFieldError
                    id={id("message-error")}
                    message={errors.message}
                  />
                )}
              </div>
            </fieldset>
            {sendError && (
              <ContactFieldError id={id("send-error")} message={sendError} />
            )}
            {!onSend && (
              <p
                id={id("demo-note")}
                className="flex items-start gap-3 rounded-xl border border-[#d3ed9a]/20 bg-[#10160f] p-4 text-sm leading-6 text-[#c5d1b9]"
              >
                <Info
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#d3ed9a]"
                />
                <span>
                  <span className="mb-1 block font-medium text-[#edf1e7]">
                    Предпросмотр без отправки
                  </span>
                  Заполните форму и проверьте сообщение в следующем окне. Оно не
                  отправляется и не сохраняется на сервере.
                </span>
              </p>
            )}
            <Button
              type="submit"
              disabled={pending}
              aria-describedby={!onSend ? id("demo-note") : undefined}
              className={
                ui.primaryAction +
                " min-h-12 w-full px-5 text-base disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {pending ? (
                <>
                  <LoaderCircle
                    className="animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Отправляем…
                </>
              ) : (
                <>
                  {onSend ? (
                    <MessageSquare size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                  {onSend ? "Отправить сообщение" : "Проверить сообщение"}
                </>
              )}
            </Button>
            <div className="flex min-h-12 flex-wrap items-start justify-between gap-2 text-sm leading-6">
              <p className="text-[#b1bda7]">* Обязательные поля</p>
              <div
                role="status"
                aria-atomic="true"
                className="min-w-0 text-[#d3ed9a]"
              >
                {!onSend && previewed && (
                  <motion.p {...feedbackMotion(reduced !== false)}>
                    Предпросмотр готов. Сообщение не отправлено.
                  </motion.p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="dark max-h-[85dvh] min-w-0 max-w-[calc(100vw_-_2rem)] overflow-y-auto rounded-2xl border border-white/15 bg-[#171c17] p-5 text-[#edf1e7] motion-reduce:animate-none sm:max-w-lg sm:p-6"
          showCloseButton={false}
        >
          <DialogHeader className="gap-3">
            {sent ? (
              <CheckCircle2
                className="mb-1 text-[#d3ed9a]"
                size={28}
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="mb-1 text-[#d3ed9a]"
                size={28}
                aria-hidden="true"
              />
            )}
            <DialogTitle className="text-2xl leading-tight">
              {sent ? "Сообщение отправлено" : "Проверьте ваше сообщение"}
            </DialogTitle>
            <DialogDescription className="text-base leading-7 text-[#b1bda7]">
              {sent
                ? "Спасибо, что поделились своими мыслями."
                : "Форма заполнена корректно. Это предварительный просмотр: сообщение не отправлено."}
            </DialogDescription>
          </DialogHeader>
          {!sent && (
            <dl className="my-2 min-w-0 space-y-4 rounded-xl border border-white/10 bg-[#10160f] p-4 text-base wrap-anywhere">
              <div>
                <dt className="text-sm text-[#b1bda7]">Имя</dt>
                <dd className="mt-1">{values.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#b1bda7]">Email</dt>
                <dd className="mt-1">{values.email}</dd>
              </div>
              {values.subject && (
                <div>
                  <dt className="text-sm text-[#b1bda7]">Тема</dt>
                  <dd className="mt-1">{values.subject}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-[#b1bda7]">Сообщение</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-7">
                  {values.message}
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter className="m-0 mt-2 gap-3 rounded-none border-white/10 bg-transparent p-0 pt-4">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className={
                ui.secondaryAction +
                " w-full text-base dark:border-white/20 dark:bg-transparent dark:hover:bg-white/5"
              }
            >
              {sent ? "Закрыть" : "Вернуться к редактированию"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ContactFieldError({ id, message }: { id: string; message: string }) {
  const reduced = useReducedMotion();
  return (
    <div
      id={id}
      role="alert"
      className="rounded-lg border border-[#ffb4b0]/20 bg-[#ffb4b0]/5 px-3 py-2 text-sm leading-6 text-[#ffb4b0]"
    >
      <motion.p {...feedbackMotion(reduced !== false)}>{message}</motion.p>
    </div>
  );
}
