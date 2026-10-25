import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { useDecorativeMotion } from "@/hooks/use-decorative-motion";
import { designClasses as ui } from "@/lib/design-system";
import { feedbackMotion } from "@/lib/motion-presets";

export default function DesignFoundationPage() {
  const [replay, setReplay] = useState(0);
  const [message, setMessage] = useState("Отклик действия появляется здесь.");
  const reduced = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const decorationAllowed = useDecorativeMotion(scope);
  return (
    <div className={ui.page}>
      <main className={`${ui.container} ${ui.section}`}>
        <Link
          to="/"
          className={`inline-flex min-h-11 items-center text-sm text-[#c5d1b9] ${ui.focus}`}
        >
          На главную
        </Link>
        <div className={`mt-8 ${ui.stack}`}>
          <p className={ui.eyebrow}>LEPEAR · ОСНОВА ДИЗАЙНА</p>
          <h1 className={ui.heroTitle}>
            Спокойный интерфейс.
            <br />
            Выразительные детали.
          </h1>
          <p className={`${ui.body} max-w-2xl`}>
            Служебная страница образцов: палитра, типографика, поверхности и
            общий характер движения. Доступна только на dev-сервере; не меняет
            тему редактора.
          </p>
          <p role="status" className={ui.caption}>
            Системное уменьшение движения:{" "}
            {reduced === null
              ? "определяется"
              : reduced
                ? "включено — элементы статичны"
                : "выключено — короткое появление"}
            .
          </p>
        </div>
        <div className={`mt-10 ${ui.grid} lg:grid-cols-2`}>
          <section className={ui.surface}>
            <h2 className={ui.cardTitle}>Типографика и палитра</h2>
            <p className={`mt-4 ${ui.body}`}>
              Кириллица и длинное описание остаются читаемыми. Основной текст —
              16 px, подписи — 14 px. Контрастные заголовки и один лаймовый
              акцент.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: "Фон", color: "#0e100f" },
                { label: "Поверхность", color: "#171c17" },
                { label: "Вложенная", color: "#22291e" },
                { label: "Акцент", color: "#d3ed9a" },
              ].map((color) => (
                <div key={color.label} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-6 rounded-full border border-white/20"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className={ui.caption}>{color.label}</span>
                </div>
              ))}
            </div>
          </section>
          <section className={ui.surface}>
            <h2 className={ui.cardTitle}>Действия и обратная связь</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                className={ui.primaryAction}
                onClick={() =>
                  setMessage("Основное действие выполнено в образце.")
                }
              >
                Основное действие
              </Button>
              <Button
                variant="outline"
                className={ui.secondaryAction}
                onClick={() =>
                  setMessage("Вторичное действие выполнено в образце.")
                }
              >
                Вторичное
              </Button>
              <Button className={ui.primaryAction} disabled>
                Недоступно
              </Button>
            </div>
            <motion.p
              key={message}
              {...feedbackMotion(reduced !== false)}
              role="status"
              className={`mt-5 ${ui.caption}`}
            >
              {message}
            </motion.p>
            <p className={`mt-3 ${ui.caption}`}>
              Отклик: 160 мс. Нет обязательной задержки перед нажатием.
            </p>
          </section>
          <section className={ui.surface}>
            <h2 className={ui.cardTitle}>Появление блока</h2>
            <Button
              variant="outline"
              className={`mt-4 ${ui.secondaryAction}`}
              onClick={() => setReplay((value) => value + 1)}
            >
              Повторить появление
            </Button>
            <Reveal key={replay} className={`mt-4 ${ui.inset}`}>
              <p className={ui.body}>
                Короткое перемещение на 8 px за 320 мс. Текст виден с первого
                кадра. При reduced motion блок появляется сразу.
              </p>
            </Reveal>
          </section>
          <section ref={scope} className={ui.surface}>
            <h2 className={ui.cardTitle}>Политика декоративных эффектов</h2>
            <div
              aria-hidden="true"
              className="mt-4 h-20 rounded-xl bg-linear-to-r from-[#22291e] via-[#425734] to-[#22291e]"
            />
            <p role="status" className={`mt-4 ${ui.caption}`}>
              {decorationAllowed
                ? "Условия для эффекта соблюдены: desktop, видимая вкладка/область, движение разрешено."
                : "Используется статичный вариант: reduced motion, мобильный экран или область не видна."}
            </p>
            <p className={`mt-3 ${ui.caption}`}>
              Это статичный образец фона. React Bits будет подключён в отдельных
              задачах первого экрана и карточек.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
