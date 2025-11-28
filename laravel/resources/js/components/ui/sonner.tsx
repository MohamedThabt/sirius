import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-green-50 !text-green-900 !border-green-200 dark:!bg-green-950 dark:!text-green-50 dark:!border-green-800",
          error: "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-50 dark:!border-red-800",
          warning: "!bg-yellow-50 !text-yellow-900 !border-yellow-200 dark:!bg-yellow-950 dark:!text-yellow-50 dark:!border-yellow-800",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-50 dark:!border-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
