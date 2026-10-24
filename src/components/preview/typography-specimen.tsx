import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  previewCardClass,
  previewControlClass,
  previewHeadingClass,
} from "@/components/preview/classes";

export function TypographySpecimen() {
  const id = useId();
  const [clicked, setClicked] = useState(false);
  return (
    <section
      aria-labelledby={id}
      className={`mt-[calc(var(--preview-component-gap)*2)] ${previewCardClass}`}
    >
      <h3
        id={id}
        className="text-[length:var(--preview-heading-size)] break-words"
      >
        Типографика: от первой идеи до готового проекта
      </h3>
      <h4
        className={`mt-[var(--preview-component-gap)] ${previewHeadingClass}`}
      >
        Кириллица, Latin и длинные подписи
      </h4>
      <p className="mt-3 text-[length:var(--preview-font-size)] break-words">
        Съешь ещё этих мягких французских булок, да выпей чаю. Хороший интерфейс
        помогает сосредоточиться на главном и легко прочитать длинное описание
        на любом экране.
      </p>
      <p className="mt-3 text-[length:var(--preview-small-size)] text-muted-foreground break-words">
        Aa Бб Ёё Йй — 0123456789 · LePear Workspace · № 24 · hello@example.com
      </p>
      <div className="mt-[var(--preview-component-gap)] flex flex-wrap gap-[var(--preview-component-gap)]">
        <Button
          type="button"
          className={previewControlClass}
          onClick={() => setClicked((value) => !value)}
        >
          {clicked
            ? "Настройки уведомлений сохранены в примере"
            : "Сохранить настройки уведомлений для всей команды"}
        </Button>
      </div>
      <p className="mt-3 text-[length:var(--preview-small-size)] text-muted-foreground">
        Образец использует ту же типографику, что формы, карточки, меню и диалог
        ниже.
      </p>
    </section>
  );
}
