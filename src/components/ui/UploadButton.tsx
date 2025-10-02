import { UploadCloud, Trash2 } from 'lucide-react'
import { Button } from './Button'

type uploadProps = {
    values: File[] | undefined,
    setValue: (value: File[]) => void
}

const UploadButton = ({ values, setValue }: uploadProps) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Attached Files</label>
            <div className="  flex rounded-md justify-center items-center  px-14 py-8 shadow-sm border border-dashed border-[var(--border-gray)] ">
                <label className=" flex cursor-pointer justify-center  items-center gap-4">
                    <img src="\icons\Upload2.svg" className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground ">
                        Choose a file or drag & drop it here.
                        <span className='text-xs text-[var(--brand-gray)]'>
                            PDF/JPG/PNG max 10 MB.
                        </span>
                    </span>
                    <input
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.currentTarget.files ?? [])
                            console.log("Selected files:", files)
                            if (values) {
                                setValue([...values, ...files])
                            } else {
                                setValue([...files])
                            }
                        }}
                    />
                </label>
            </div>

            <ul className="space-y-2">
                {values?.map((f: File, i: number) => (
                    <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                        <span className="text-sm truncate">{f.name}</span>
                        <Button
                            type="button"
                            className="text-red-500 cursor-pointer"
                            onClick={() => {
                                const next = [...values]
                                next.splice(i, 1)
                                console.log("Remaining files:", next)
                                setValue(next)
                            }}
                        >
                            <Trash2 className="mr-1 size-4" />
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default UploadButton