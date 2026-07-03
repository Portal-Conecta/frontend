import { Text } from "@portal/ui/atoms";

export interface ErrosPageProps{
    code : string,
    title: string,
    description: string
}

export function ErrosPage({code,title, description}:ErrosPageProps){
    return (
        <div className="flex flex-col items-center justify-self-center justify-center h-[100%] px-4 text-center">
            <Text className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[15rem] text-blue-100 tracking-[0.6em] -mr-[0.6em]">{code}</Text>
            <div className="flex flex-col items-center gap-4">
                <Text tone="brand" variant="heading-h2" className="lg:text-heading-h1">{title}</Text>
                <Text tone="secondary" variant="body-sm">{description}</Text>
            </div>
        </div>
    )
}