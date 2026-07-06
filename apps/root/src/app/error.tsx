import { ErrorsPage } from '@portal/ui/molecules/Errors';
import { AppLayout } from '@portal/core';

export default function Error(){
    return(
        <AppLayout items={[]}>
            <ErrorsPage
                code='500'
                title='ERRO INTERNO DO SERVIDOR'
                description='Ops! algo deu errado em nossos servidores. Estamos trabalhando para resolver isso o mais rápido possível'
            />
        </AppLayout>
    )
}