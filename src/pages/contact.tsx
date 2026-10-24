import { ArrowLeft, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="dark min-h-dvh bg-[#0e100f] px-5 py-7 font-sans text-[#f2f3ed] sm:px-10 sm:py-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
          aria-label="LePear — на главную"
        >
          <Sprout className="text-[#d3ed9a]" aria-hidden="true" />
          LePear
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-[#b5bfab] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ed9a]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          На главную
        </Link>
      </header>
      <main className="mx-auto grid max-w-6xl items-start gap-10 py-12 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-14">
          <span className="text-xs font-medium tracking-[0.18em] text-[#c5dbab]">
            НАЧНЁМ С РАЗГОВОРА
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            Хорошие идеи
            <br />
            <span className="text-[#a0ad94]">заслуживают ответа.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-8 text-[#a8b39f]">
            Помогите сделать LePear лучше. Расскажите, чего вам не хватает,
            задайте вопрос или предложите новую возможность.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#a8b39f]">
            Сейчас форма работает в режиме предпросмотра. Отправку подключим,
            когда будет готов канал обратной связи.
          </p>
        </div>
        <ContactForm />
      </main>
    </div>
  );
}
