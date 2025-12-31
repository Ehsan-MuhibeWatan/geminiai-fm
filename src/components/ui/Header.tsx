import { useAudioClip } from "@/hooks/useAudioClip";
import clsx from "clsx";

export const Header = () => {
  const playToggle = useAudioClip("/click.wav");

  return (
    <header className="flex w-full max-w-(--page-max-width) mx-auto mb-12 md:mb-8">
      <div className="grid grid-cols-12 gap-x-3">
        {/* LOGO */}
        <div className="col-span-2 order-1 mb-8 md:mb-0">
          <div
            className={clsx("relative top-[0.0875rem] cursor-pointer")}
            onClick={() => {
              playToggle();
            }}
          >
            <Logo />
          </div>
        </div>

        {/* MESSAGE */}
        <div className="col-span-12 md:col-span-10 xl:col-span-10 order-3 md:order-2">
          <div className="text-balance">
            <div className="text-current/90 mb-2 font-semibold">
              ⚠️ This is a LIVE public demo running on a paid OpenAI API
            </div>

            <div className="text-current/75 mb-3 leading-relaxed">
              I personally recharge this API every day to keep this demo free
              while I’m building a full, step-by-step deployment tutorial.
              <br />
              Public access means real cost.
            </div>

            <div className="text-current/70 mb-4 leading-relaxed">
              👉 Once you deploy this on your <strong>own server</strong>,
              usage is minimal and almost free.
              <br />
              👉 The complete tutorial is coming in{" "}
              <strong>2–3 days</strong> (already 4 days in progress).
            </div>

            <a
              href="https://www.youtube.com/@muhibb-e-watan"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase inline-block font-semibold text-red-600 hover:text-red-500 transition-colors"
            >
              ▶ Support the work on YouTube (Watch • Like • Subscribe)
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

const Logo = () => {
  return (
    <svg
      width="91"
      height="18"
      viewBox="0 0 91 18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SVG paths unchanged */}
    </svg>
  );
};
