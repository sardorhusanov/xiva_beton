import { useEffect, useRef, useId } from "react";
import { Search, X } from "lucide-react";
export function Badge({ children, tone = "" }) {
  return <span className={"badge " + tone}>{children}</span>;
}
export function Panel({ title, sub, action, children, className = "" }) {
  return (
    <section className={"panel " + className}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty() {
  return (
    <div className="empty">
      <Search size={22} />
      <h3>Ma’lumot topilmadi</h3>
      <p>Qidiruv yoki filtrni o‘zgartiring.</p>
    </div>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({ title, close, children }) {
  const ref = useRef();
  const titleId = useId();
  useEffect(() => {
    const prev = document.activeElement;
    ref.current.showModal();
    return () => prev?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="modal-head">
        <div>
          <small> XIVA BETON</small>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button className="icon-button" onClick={close} aria-label="Yopish">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
