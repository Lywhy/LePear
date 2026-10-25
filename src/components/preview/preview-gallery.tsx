import { useId, useState, type FormEvent, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTransitions } from "@/lib/motion-presets";
import { Check, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  previewCardClass,
  previewControlClass,
  previewHeadingClass,
  previewInputClass,
} from "@/components/preview/classes";

type GalleryProps = { portalContainer: RefObject<HTMLDivElement | null> };
const roles = [
  { value: "viewer", label: "Наблюдатель" },
  { value: "editor", label: "Редактор" },
  { value: "admin", label: "Администратор" },
];

export function PreviewGallery({ portalContainer }: GalleryProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState("components");
  const transition =
    reduced !== false ? { duration: 0 } : motionTransitions.feedback;
  const [role, setRole] = useState("editor");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Введите email, например hello@example.com.");
      document.getElementById(`${id}-email`)?.focus();
      return;
    }
    setEmailError("");
    setMessage(
      `Форма принята в примере. Роль: ${roles.find((item) => item.value === role)?.label}. Данные не отправлялись.`,
    );
  }
  return (
    <section
      className="mt-[calc(var(--preview-component-gap)*2)] border-t pt-[var(--preview-component-padding)]"
      aria-label="Каталог компонентов темы"
    >
      <p className="mb-2 text-[length:var(--preview-small-size)] text-muted-foreground">
        03 / Каталог
      </p>
      <h3 className={previewHeadingClass}>Компоненты и состояния</h3>
      <p className="mt-2 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
        Наводите курсор, переходите клавишей Tab, открывайте списки и диалог.
        Все действия выполняются только в примерах.
      </p>
      <Tabs
        value={activeTab}
        onValueChange={(next) => {
          if (typeof next === "string") setActiveTab(next);
        }}
        className="mt-[var(--preview-component-gap)] gap-[var(--preview-component-gap)]"
      >
        <TabsList
          aria-label="Разделы каталога компонентов"
          className="h-auto min-h-[var(--preview-control-safe-height)] w-full flex-wrap justify-start gap-[calc(var(--preview-component-gap)*.5)] rounded-[calc(var(--radius)*.7)] border bg-muted p-[calc(var(--preview-component-gap)*.25)] group-data-horizontal/tabs:h-auto"
        >
          <TabsTrigger
            value="components"
            className={
              previewControlClass +
              " transition-colors motion-reduce:transition-none"
            }
          >
            Компоненты
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className={
              previewControlClass +
              " transition-colors motion-reduce:transition-none"
            }
          >
            Таблица
          </TabsTrigger>
        </TabsList>
        <TabsContent
          keepMounted
          value="components"
          className="min-w-0 text-[length:var(--preview-font-size)]"
        >
          <motion.div
            initial={false}
            animate={{ opacity: activeTab === "components" ? 1 : 0.92 }}
            transition={transition}
            className="grid gap-[var(--preview-component-gap)] @min-[650px]:grid-cols-2"
          >
            <Card className={previewCardClass}>
              <div className="border-b pb-[var(--preview-component-gap)]">
                <p className="mb-2 text-[length:var(--preview-small-size)] text-muted-foreground">
                  Действия
                </p>
                <h4 className={previewHeadingClass}>Кнопки и диалог</h4>
              </div>
              <div className="flex flex-wrap gap-[var(--preview-component-gap)]">
                <Button
                  className={previewControlClass}
                  onClick={() =>
                    setMessage("Основное действие выполнено в примере.")
                  }
                >
                  <Plus size={16} />
                  Основная
                </Button>
                <Button
                  className={previewControlClass}
                  variant="secondary"
                  onClick={() =>
                    setMessage("Вторичное действие выполнено в примере.")
                  }
                >
                  Вторичная
                </Button>
                <Button
                  className={previewControlClass}
                  variant="outline"
                  onClick={() => setMessage("Контурная кнопка нажата.")}
                >
                  Контурная
                </Button>
                <Button
                  className={previewControlClass}
                  variant="ghost"
                  onClick={() => setMessage("Кнопка без фона нажата.")}
                >
                  Без фона
                </Button>
                <Button
                  className={previewControlClass}
                  variant="destructive"
                  onClick={() =>
                    setMessage(
                      "Это пример опасного действия. Ничего не удалено.",
                    )
                  }
                >
                  Опасное действие
                </Button>
                <Button className={previewControlClass} disabled>
                  Недоступно
                </Button>
              </div>
              <p className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground">
                У кнопок есть hover, focus и active. Последняя отключена и не
                реагирует на ввод.
              </p>
              <PreviewDialog
                portalContainer={portalContainer}
                onComplete={setMessage}
              />
            </Card>
            <Card className={previewCardClass}>
              <div className="border-b pb-[var(--preview-component-gap)]">
                <p className="mb-2 text-[length:var(--preview-small-size)] text-muted-foreground">
                  Ввод данных
                </p>
                <h4 className={previewHeadingClass}>Поля и выбор</h4>
              </div>
              <form
                noValidate
                className="space-y-[var(--preview-component-gap)]"
                onSubmit={submit}
                aria-label="Пример формы компонентов"
              >
                <div className="space-y-[calc(var(--preview-component-gap)*.5)]">
                  <Label
                    htmlFor={`${id}-email`}
                    className="text-[length:var(--preview-small-size)]"
                  >
                    Email
                  </Label>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="hello@example.com"
                    required
                    aria-invalid={!!emailError}
                    aria-describedby={
                      emailError ? `${id}-email-error` : `${id}-email-hint`
                    }
                    className={previewInputClass}
                  />
                  {emailError ? (
                    <p
                      id={`${id}-email-error`}
                      role="alert"
                      className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-destructive"
                    >
                      {emailError}
                    </p>
                  ) : (
                    <p
                      id={`${id}-email-hint`}
                      className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground"
                    >
                      Нажмите «Применить» с пустым полем, чтобы увидеть ошибку.
                    </p>
                  )}
                </div>
                <div className="space-y-[calc(var(--preview-component-gap)*.5)]">
                  <Label
                    id={`${id}-role-label`}
                    htmlFor={`${id}-role`}
                    className="text-[length:var(--preview-small-size)]"
                  >
                    Роль участника
                  </Label>
                  <Select
                    items={roles}
                    value={role}
                    onValueChange={(value) => {
                      if (typeof value === "string") setRole(value);
                    }}
                  >
                    <SelectTrigger
                      id={`${id}-role`}
                      aria-labelledby={`${id}-role-label`}
                      className={previewInputClass}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      portalContainer={portalContainer}
                      alignItemWithTrigger={false}
                      className="rounded-[var(--radius)] p-[calc(var(--preview-component-gap)*.25)] text-[length:var(--preview-font-size)]"
                    >
                      {roles.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                          className="h-auto min-h-[var(--preview-control-safe-height)] rounded-[calc(var(--radius)*.7)] px-[var(--preview-control-padding)] py-[var(--preview-control-padding-block)] *:min-w-0 *:shrink *:whitespace-normal *:break-words text-[length:var(--preview-small-size)]"
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-h-[var(--preview-control-safe-height)] items-start gap-[var(--preview-component-gap)]">
                  <Checkbox
                    id={`${id}-accepted`}
                    checked={accepted}
                    onCheckedChange={setAccepted}
                    className="mt-1 rounded-[calc(var(--radius)*.5)]"
                  />
                  <Label
                    htmlFor={`${id}-accepted`}
                    className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] font-[number:var(--preview-font-weight)]"
                  >
                    Включить участника в команду
                  </Label>
                </div>
                <div className="flex min-h-[var(--preview-control-safe-height)] items-center justify-between gap-[var(--preview-component-gap)]">
                  <Label
                    htmlFor={`${id}-notifications`}
                    className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] font-[number:var(--preview-font-weight)]"
                  >
                    Уведомления
                  </Label>
                  <Switch
                    id={`${id}-notifications`}
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="space-y-[calc(var(--preview-component-gap)*.5)]">
                  <Label
                    htmlFor={`${id}-disabled`}
                    className="text-[length:var(--preview-small-size)] text-muted-foreground"
                  >
                    Недоступное поле
                  </Label>
                  <Input
                    id={`${id}-disabled`}
                    disabled
                    value="Только для администратора"
                    className={previewInputClass}
                  />
                </div>
                <div className="flex flex-wrap gap-[var(--preview-component-gap)]">
                  <Button
                    type="submit"
                    disabled={!accepted}
                    className={previewControlClass}
                  >
                    Применить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={previewControlClass}
                    onClick={() => {
                      setEmail("");
                      setRole("editor");
                      setAccepted(true);
                      setNotifications(true);
                      setEmailError("");
                      setMessage("Состояние примера формы восстановлено.");
                    }}
                  >
                    Сбросить пример
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent
          keepMounted
          value="table"
          className="min-w-0 text-[length:var(--preview-font-size)]"
        >
          <motion.div
            initial={false}
            animate={{ opacity: activeTab === "table" ? 1 : 0.92 }}
            transition={transition}
          >
            <PreviewTable onMessage={setMessage} />
          </motion.div>
        </TabsContent>
      </Tabs>
      <div className="mt-[var(--preview-component-gap)] rounded-[calc(var(--radius)*.7)] border bg-muted/40 p-[var(--preview-component-padding)]">
        <p className="text-[length:var(--preview-small-size)] font-[number:var(--preview-heading-weight)]">
          Демонстрационный режим
        </p>
        <p className="mt-2 text-[length:var(--preview-small-size)] text-muted-foreground">
          Можно заполнять формы и изменять таблицу. Данные остаются в примерах и
          не отправляются на сервер.
        </p>
        <p
          role="status"
          className="mt-[var(--preview-component-gap)] min-h-7 text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)] text-muted-foreground"
        >
          {message || "Здесь появится результат действия в примере."}
        </p>
      </div>
    </section>
  );
}

function PreviewDialog({
  portalContainer,
  onComplete,
}: GalleryProps & { onComplete: (message: string) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Новый проект");
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) {
      setError("Введите название длиной не менее 2 символов.");
      return;
    }
    onComplete(
      `Проект «${value}» сохранён в примере. На сервер данные не отправлялись.`,
    );
    setOpen(false);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setError("");
      }}
    >
      <DialogTrigger
        render={<Button variant="outline" className={previewControlClass} />}
      >
        Открыть диалог
      </DialogTrigger>
      <DialogContent
        portalContainer={portalContainer}
        showCloseButton={false}
        className="gap-[var(--preview-component-gap)] max-h-[85dvh] overflow-y-auto rounded-[var(--radius)] border p-[var(--preview-component-padding)] text-[length:var(--preview-font-size)] font-[number:var(--preview-font-weight)] leading-[var(--preview-line-height)] tracking-[var(--preview-letter-spacing)] max-w-[min(calc(100vw_-_2rem),var(--preview-dialog-max-width))] sm:max-w-[min(calc(100vw_-_2rem),var(--preview-dialog-max-width))]"
      >
        <DialogHeader className="gap-[calc(var(--preview-component-gap)*.5)]">
          <DialogTitle className="pr-3 text-[length:var(--preview-subheading-size)] leading-[var(--preview-line-height)] font-[number:var(--preview-heading-weight)]">
            Настройки проекта
          </DialogTitle>
          <DialogDescription className="text-[length:var(--preview-small-size)] leading-[var(--preview-line-height)]">
            Диалог использует текущую тему предпросмотра. Можно изменить
            название и сохранить его в примере.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={save}
          noValidate
          className="mt-2 space-y-[var(--preview-component-gap)]"
        >
          <div className="space-y-[calc(var(--preview-component-gap)*.5)]">
            <Label
              htmlFor={`${id}-name`}
              className="text-[length:var(--preview-small-size)]"
            >
              Название проекта
            </Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={80}
              required
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={previewInputClass}
            />
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="text-[length:var(--preview-small-size)] text-destructive"
              >
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="m-0 mt-[var(--preview-component-gap)] flex-wrap gap-[var(--preview-component-gap)] rounded-none border-t bg-transparent p-0 pt-[var(--preview-component-padding)]">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={previewControlClass}
                />
              }
            >
              Отмена
            </DialogClose>
            <Button type="submit" className={previewControlClass}>
              <Check size={16} />
              Сохранить пример
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const exampleRows = [
  { id: "landing", name: "Главная страница", status: "Готово", owner: "Анна" },
  { id: "theme", name: "Новая тема", status: "В работе", owner: "Максим" },
  { id: "docs", name: "Документация", status: "Черновик", owner: "Ирина" },
];
function PreviewTable({ onMessage }: { onMessage: (message: string) => void }) {
  const [rows, setRows] = useState(exampleRows);
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  function selectRow(id: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current.filter((item) => item !== id), id]
        : current.filter((item) => item !== id),
    );
  }
  return (
    <Card className={previewCardClass}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--preview-component-gap)]">
        <div>
          <h4 className={previewHeadingClass}>Проекты команды</h4>
          <p className="mt-2 text-[length:var(--preview-small-size)] text-muted-foreground">
            Демонстрационные данные · выбрано: {selected.length}
          </p>
        </div>
        <Button
          variant="outline"
          className={previewControlClass}
          onClick={() => {
            setRows(exampleRows);
            setSelected([]);
            onMessage("Исходные строки таблицы восстановлены.");
          }}
        >
          <RotateCcw size={16} />
          Восстановить
        </Button>
      </div>
      <Table
        containerProps={{
          tabIndex: 0,
          role: "region",
          "aria-label": "Проекты команды — таблица с горизонтальной прокруткой",
          className:
            "rounded-[calc(var(--radius)*.7)] border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        }}
        className="text-[length:var(--preview-small-size)] [&_th]:h-[var(--preview-control-safe-height)] [&_td]:h-[var(--preview-control-safe-height)] [&_th]:px-[var(--preview-control-padding)] [&_td]:px-[var(--preview-control-padding)] [&_th]:py-[var(--preview-control-padding-block)] [&_td]:py-[var(--preview-control-padding-block)]"
      >
        <TableCaption className="text-[length:var(--preview-font-size)] leading-[var(--preview-line-height)]">
          Выделяйте строки чекбоксами. В узком режиме таблица прокручивается
          горизонтально.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="Выбрать все проекты"
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                disabled={rows.length === 0}
                onCheckedChange={(checked) =>
                  setSelected(checked ? rows.map((row) => row.id) : [])
                }
              />
            </TableHead>
            <TableHead
              scope="col"
              className="h-auto min-w-32 py-3 whitespace-normal"
            >
              Проект
            </TableHead>
            <TableHead
              scope="col"
              className="h-auto min-w-32 py-3 whitespace-normal"
            >
              Статус
            </TableHead>
            <TableHead
              scope="col"
              className="h-auto min-w-32 py-3 whitespace-normal"
            >
              Участник
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={selected.includes(row.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Выбрать проект «${row.name}»`}
                    checked={selected.includes(row.id)}
                    onCheckedChange={(checked) => selectRow(row.id, checked)}
                  />
                </TableCell>
                <TableCell className="min-w-40 whitespace-normal break-words font-[number:var(--preview-font-weight)]">
                  {row.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={row.status === "Готово" ? "default" : "secondary"}
                    className="max-w-full rounded-[calc(var(--radius)*.5)] text-[length:var(--preview-small-size)] whitespace-normal"
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.owner}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                Все строки архивированы в примере.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-[var(--preview-component-gap)]">
        <p className="text-[length:var(--preview-small-size)] text-muted-foreground">
          Записей: {rows.length}
        </p>
        <Button
          variant="secondary"
          disabled={!selected.length}
          className={previewControlClass}
          onClick={() => {
            setRows((current) =>
              current.filter((row) => !selected.includes(row.id)),
            );
            onMessage(`В примере архивировано записей: ${selected.length}.`);
            setSelected([]);
          }}
        >
          Архивировать выбранное
        </Button>
      </div>
    </Card>
  );
}
