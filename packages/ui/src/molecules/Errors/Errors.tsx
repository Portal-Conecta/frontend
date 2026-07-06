import { Text } from "@portal/ui/atoms";

export interface ErrorsPageProps{
    code : string,
    title: string,
    description: string
}

export function ErrorsPage({code,title, description}:ErrorsPageProps){
    return (
        <div className="flex flex-col items-center justify-self-center justify-center h-[100%] px-4 text-center">
            //O h1 está com número fora dos Tokens, pois os tokens não tem registrado com base no tamanho do que está sendo usando no protótipo
            //O  mr é para corrigir o erro de centralização que gera o tracking/espaçamento
            <h1 className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[15rem] text-interactive-subtle tracking-[0.6em] -mr-[0.6em]">{code}</h1>
            <div className="flex flex-col items-center gap-4">
                <Text tone="brand" variant="heading-h2" className="lg:text-heading-h1">{title}</Text>
                <Text tone="secondary" variant="body-sm">{description}</Text>
            </div>
        </div>
    )
}