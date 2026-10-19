import { AlertCircle, Loader2 } from "lucide-react";
import { STATUS } from "../async-data-handler";

export type AsyncResultProps = {
  status: STATUS;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

function AsyncResult({
  status,
  title,
  description,
  children,
}: AsyncResultProps) {
  const styles = (status: STATUS) => {
    switch (status) {
      case STATUS.IDLE:
      case STATUS.EMPTY:
        return "text-muted-foreground";
      case STATUS.LOADING:
        return "text-foreground";
      case STATUS.SUCCESS:
        return "text-success";
      case STATUS.ERROR:
        return "text-red-500 font-bold";
    }
  };

  const icon = (status: STATUS) => {
    switch (status) {
      case STATUS.IDLE:
      case STATUS.EMPTY:
      case STATUS.LOADING:
        return <Loader2 size={24} className="animate-spin text-brand" />;
      case STATUS.ERROR:
        return <AlertCircle size={24} className="text-red-500" />;
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center p-4 min-h-48 ${styles(status)}`}
    >
      {status !== STATUS.LOADING && (
        <>
          {status === STATUS.ERROR && icon(status)}
          {title && <h2 className="font-bold">{title}</h2>}
          {description && <p>{description}</p>}
        </>
      )}

      {status === STATUS.LOADING && (
        <div className="flex gap-2 items-center justify-center">
          {icon(status)}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

export default AsyncResult;
