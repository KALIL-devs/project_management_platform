type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
}: ButtonProps) {
  const base = "font-semibold py-2 px-4 rounded-lg transition-colors text-sm";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}