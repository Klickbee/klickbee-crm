type ModalProps = {
    open: boolean
    onClose: () => void
    children: any
}
const Modal = ({ open, onClose, children }: ModalProps) => {
    return (
        <div className="w-full h-full bg-black/50 fixed top-0 left-0 z-50" aria-hidden={!open}
            onClick={(e) => {
                // Close when clicking the backdrop only
                if ((e.target as HTMLElement).id === "filter-backdrop") onClose()
            }}
            id="filter-backdrop"
            style={{ visibility: open ? "visible" : "hidden" }}>
            {children}
        </div>
    )
}

export default Modal