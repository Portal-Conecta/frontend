import { Text } from "@portal/ui/atoms";
import { Input } from "@portal/ui/atoms";

interface FormFieldProps {
    label:string,
    placeholder ?: string,
}

export function FormField({label,placeholder}:FormFieldProps){
    return(
       <>
        <Text variant='body-md' className='text-text-brand'>{label}</Text>
        <Input placeholder={placeholder}></Input>
       </>
    )
}