import { useAudioClip } from "@/hooks/useAudioClip";
import clsx from "clsx";

export const Header = () => {
  const playToggle = useAudioClip("/click.wav");

  return (
    <header className="flex w-full max-w-(--page-max-width) mx-auto mb-6 md:mb-8 px-4 sm:px-0">
      <div className="grid grid-cols-12 gap-x-4 w-full items-center">
        
        {/* --- LOGO (Left Side) --- */}
        <div className="col-span-12 md:col-span-2 mb-4 md:mb-0 flex justify-center md:justify-start">
          <div
            className={clsx("relative top-[0.0875rem] cursor-pointer")}
            onClick={() => {
              playToggle();
            }}
          >
            <Logo />
          </div>
        </div>

        {/* --- SMART COMPACT BANNER (Right Side) --- */}
        <div className="col-span-12 md:col-span-10">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            
            {/* Warning Text */}
            <p className="flex items-center gap-2 text-center sm:text-left leading-tight">
              <span className="text-lg">⚠️</span>
              <span>
                This is a <b>LIVE demo</b>. Deploy on your own cloud for <b>Unlimited Free Use</b>.
              </span>
            </p>

            {/* Action Button */}
            <a
              href="https://www.youtube.com/@muhibb-e-watan"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap flex items-center gap-2 rounded bg-red-600/20 px-4 py-2 font-bold text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors border border-red-500/30"
            >
              <span>▶</span> Watch Tutorial
            </a>
          </div>
        </div>

      </div>
    </header>
  );
};

// --- LOGO COMPONENT ---
const Logo = () => {
  return (
    <svg
      width="91"
      height="18"
      viewBox="0 0 91 18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ⚠️ IMPORTANT: Aap nay jo SVG paths 'unchanged' rakhay thay, wo yahan ayen gay. 
          Agar aap nay purana code copy nahi kiya, to neechay walay paths use karein 
          (Yeh Default 'MyAIFM' Logo paths ho saktay hain agar aap ka custom logo nahi hai).
          AGAR CUSTOM LOGO HAI TO APNA PURANA SVG YAHAN PASTE KAREIN. */}
      
      <path d="M5.44521 13.7844H3.64362V7.12061H3.59081L1.87449 11.761H0.871191L-0.845129 7.12061H-0.897937V13.7844H-2.69953V3.68262H-1.31168L0.369528 8.44893H0.422336L2.11212 3.68262H3.50005L5.44521 13.7844Z" />
      <path d="M8.6322 15.6587L9.52115 13.7844H7.23932L8.6322 15.6587ZM10.7139 12.0621C11.6669 12.0621 12.3963 11.238 12.3963 9.94073V3.68262H14.1979V9.94073C14.1979 12.4497 12.6369 13.7844 10.7139 13.7844C8.78469 13.7844 7.23 12.4497 7.23 9.94073V3.68262H9.03158V9.94073C9.03158 11.238 9.76092 12.0621 10.7139 12.0621Z" />
      <path d="M19.1678 11.3762H16.2996V3.68262H19.1678V11.3762Z" />
      <path d="M24.8971 3.68262H22.029V13.7844H24.8971V3.68262Z" />
      <path d="M28.0033 3.68262H34.4258V5.37241H29.805V7.81583H34.0209V9.50562H29.805V13.7844H28.0033V3.68262Z" />
      <path d="M37.7766 13.7844H35.975V3.68262H37.8822L40.1616 10.5165H40.2144L42.4849 3.68262H44.3921V13.7844H42.5905V7.04146H42.5377L40.6712 12.5002H39.6951L37.8294 7.04146H37.7766V13.7844Z" />
      <circle cx="49" cy="12" r="2" fill="currentColor"/>
    </svg>
  );
};
