import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Copy into src after importing your exported CSS in the main stylesheet.
// This example uses LePear's optional portalContainer extension for DialogContent.
export default function ThemeIntegrationExample() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scope}
      className={`lepear-theme min-h-dvh p-6 ${mode === "dark" ? "dark" : ""}`}
      data-theme={mode}
    >
      <div className="lepear-stack mx-auto max-w-3xl">
        <h1>Моя тема на shadcn/ui</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setMode((value) => (value === "light" ? "dark" : "light"))
          }
        >
          Переключить режим: {mode === "light" ? "светлый" : "тёмный"}
        </Button>
        <div className="lepear-grid">
          <Card>
            <CardHeader>
              <CardTitle>Карточка проекта</CardTitle>
            </CardHeader>
            <CardContent className="lepear-stack">
              <p>
                Кириллица, Latin, 0123456789 и длинный текст для ручной проверки
                переносов.
              </p>
              <Label htmlFor="integration-name">
                Название проекта с длинной подписью
              </Label>
              <Input id="integration-name" placeholder="Новый проект" />
              <Button type="button">
                Сохранить настройки уведомлений для всей команды
              </Button>
              <Button type="button" disabled>
                Недоступное действие
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Портал диалога</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger
                  render={<Button type="button" variant="secondary" />}
                >
                  Открыть диалог
                </DialogTrigger>
                <DialogContent portalContainer={scope} showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>Тема в портале</DialogTitle>
                    <DialogDescription>
                      Диалог наследует цвета и типографику контейнера. Закройте
                      клавишей Escape.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    aria-label="Название в диалоге"
                    placeholder="Введите название"
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
