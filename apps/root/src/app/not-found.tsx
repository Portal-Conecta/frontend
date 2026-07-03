import { ErrosPage } from '@portal/ui/molecules/Errors';
import { AppLayout } from '@portal/core';

export default function NotFound(){
    return(
        <AppLayout items={[]}>
            <ErrosPage
                code='404'
                title='PÁGINA NÃO ENCONTRADA'
                description='Desculpe, a página que você está procurando não existe ou foi removida'
            />
        </AppLayout>
    )
}