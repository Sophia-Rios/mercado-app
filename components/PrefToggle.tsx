export default function PrefToggle({
  label,
  descricao,
  ativo,
  onClick,
}: {
  label: string;
  descricao: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted">{descricao}</p>
      </div>
      <button
        onClick={onClick}
        aria-pressed={ativo}
        className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-0.5 transition-colors ${
          ativo ? "bg-accent justify-end" : "bg-surface-raised justify-start"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-bg shadow ring-1 ring-border" />
      </button>
    </div>
  );
}
