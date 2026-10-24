import { useId, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
} from "lucide-react";
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
  const id = (field: string) => `${prefix}-${field}`;
  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSendError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    ) as ContactValues;
    const next: typeof errors = {};
    if (data.name.length < 2) next.name = "Укажите имя: минимум 2 символа.";
    if (data.message.length < 10)
      next.message = "Добавьте немного деталей: минимум 10 символов.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(id(next.name ? "name" : "message"))?.focus();
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
      setValues(data);
      setOpen(true);
    }
  }
  const fieldClass = "min-h-11 rounded-lg px-3 text-base md:text-base";
  return (
    <>
      <Card className="w-full gap-6 rounded-2xl border border-white/10 bg-[#171c17] py-7 text-[#edf1e7] shadow-xl ring-0 sm:py-8">
        <CardHeader className="gap-3 px-6 sm:px-8">
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl border border-[#d3ed9a]/20 bg-[#d3ed9a]/10 text-[#d3ed9a]">
            <MessageSquare size={21} aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-medium tracking-tight">
            Напишите нам
          </CardTitle>
          <CardDescription className="text-base leading-7 text-[#a8b39f]">
            Идея, вопрос или предложение для LePear — расскажите, что у вас на
            уме.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <form
            onSubmit={submit}
            className="space-y-6"
            aria-label="Контактная форма"
            aria-busy={pending}
          >
            <fieldset
              disabled={pending}
              className="min-w-0 space-y-5 disabled:opacity-70"
            >
              <legend className="sr-only">Ваши контакты и сообщение</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor={id("name")} className="text-sm">
                    Имя <span className="text-[#a8b39f]">*</span>
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
                    <p
                      id={id("name-error")}
                      className="text-sm text-red-300"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor={id("email")} className="text-sm">
                    Email <span className="text-[#a8b39f]">*</span>
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
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor={id("subject")} className="flex-wrap text-sm">
                  Тема{" "}
                  <span className="font-normal text-[#a8b39f]">
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
              <div className="space-y-2.5">
                <Label htmlFor={id("message")} className="text-sm">
                  Сообщение <span className="text-[#a8b39f]">*</span>
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
                  className="min-h-36 resize-y rounded-lg p-3 text-base leading-7 md:text-base"
                  aria-invalid={!!errors.message}
                  aria-describedby={`${id("message-hint")}${errors.message ? ` ${id("message-error")}` : ""}`}
                />
                <div
                  id={id("message-hint")}
                  className="flex justify-between gap-3 text-sm text-[#a8b39f]"
                >
                  <span>От 10 до 3000 символов</span>
                  <span>{values.message.length}/3000</span>
                </div>
                {errors.message && (
                  <p
                    id={id("message-error")}
                    role="alert"
                    className="text-sm text-red-300"
                  >
                    {errors.message}
                  </p>
                )}
              </div>
            </fieldset>
            {sendError && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm leading-6 text-red-200"
              >
                {sendError}
              </p>
            )}
            {!onSend && (
              <p
                id={id("demo-note")}
                className="rounded-lg border border-white/10 bg-white/3 p-3 text-sm leading-6 text-[#bcc6b3]"
              >
                Демонстрация формы. Сообщение можно проверить, но оно не
                отправляется.
              </p>
            )}
            <Button
              type="submit"
              disabled={pending}
              aria-describedby={!onSend ? id("demo-note") : undefined}
              className="h-12 w-full gap-3 rounded-lg bg-[#d3ed9a] px-5 text-base text-[#182112] hover:bg-[#e0f6b7] focus-visible:ring-[#d3ed9a]"
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
                  {onSend ? "Отправить сообщение" : "Проверить сообщение"}
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </Button>
            <p className="text-sm text-[#a8b39f]">* Обязательные поля</p>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="dark max-h-[85dvh] overflow-y-auto border border-white/10 bg-[#171c17] p-6 text-[#edf1e7] sm:max-w-lg"
          showCloseButton={false}
        >
          <DialogHeader className="gap-3">
            <CheckCircle2
              className="mb-1 text-[#d3ed9a]"
              size={28}
              aria-hidden="true"
            />
            <DialogTitle className="text-2xl leading-tight">
              {sent ? "Сообщение отправлено" : "Проверьте ваше сообщение"}
            </DialogTitle>
            <DialogDescription className="text-base leading-7 text-[#a8b39f]">
              {sent
                ? "Спасибо, что поделились своими мыслями."
                : "Форма заполнена корректно. Это предварительный просмотр: сообщение не отправлено."}
            </DialogDescription>
          </DialogHeader>
          {!sent && (
            <dl className="my-2 space-y-4 break-words text-base">
              <div>
                <dt className="text-sm text-[#a8b39f]">Имя</dt>
                <dd className="mt-1">{values.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#a8b39f]">Email</dt>
                <dd className="mt-1">{values.email}</dd>
              </div>
              {values.subject && (
                <div>
                  <dt className="text-sm text-[#a8b39f]">Тема</dt>
                  <dd className="mt-1">{values.subject}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-[#a8b39f]">Сообщение</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-7">
                  {values.message}
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter className="-mx-6 -mb-6 mt-2 p-6">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="h-11 px-4 text-base"
            >
              {sent ? "Закрыть" : "Вернуться к редактированию"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
