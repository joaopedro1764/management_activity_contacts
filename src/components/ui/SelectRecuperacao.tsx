import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface OptionItem {
    id: string
    status: string
}

interface SelectRecuperacaoProps {
    options: OptionItem[]
    value: OptionItem
    setValue: (item: OptionItem) => void
    placeholder?: string
    recuperado: boolean
}

export function SelectRecuperacao({ options, value, setValue, placeholder = "Selecione", recuperado }: SelectRecuperacaoProps) {

    return (
        <Select
            value={value?.id}
            onValueChange={(idSelecionado) => {
                const itemSelecionado = options.find(item => item.id === idSelecionado)
                if (itemSelecionado) {
                    setValue(itemSelecionado)
                }
            }}
        >
            <SelectTrigger className={`w-full bg-white text-xs ${recuperado ? "border-green-300 focus:border-green-500" : "border-red-300 focus:border-red-500"} `}>
                <SelectValue placeholder={placeholder}>
                    {value?.status}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {options.map((item) => (
                   <div className="flex items-center">
                   <div className={`w-2 h-2 ${recuperado? "bg-green-500": "bg-red-500"} rounded-full`}/>
                    <SelectItem  key={item.id} value={item.id}>
                        {item.status}
                    </SelectItem>
                    </div>
                ))}
            </SelectContent>
        </Select>
    )
}
