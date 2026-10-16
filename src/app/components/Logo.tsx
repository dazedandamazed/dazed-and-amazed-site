import logoImage from "../../imports/logo_dazed_for_website.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center flex-shrink-0 overflow-hidden ${className}`}>
      <img
        src={logoImage}
        alt="Dazed and Amazed"
        className="h-auto w-[230px] sm:w-[290px] xl:w-[418px]"
      />
    </div>
  );
}
