import { AppShell } from "../layout/AppShell"
import { ClassCardItem, Icon, SearchBarItem, SidebarItem } from "@portal/ui"
import { Text, Button, Input, Field, ClassCard, ListItem } from "@portal/ui"



export async function PageTurma(){
    return(
        <AppShell 
            user={null}
            activeKey="Turma"
            children={
            <div className="px-8 py-6">
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between">
                        <Text tone="brand" variant="heading-h2">Turmas</Text>
                        <Button iconLeft="plus" size='sm'>Criar Nova Turma</Button>
                    </div>
                    <Input/>
                </div>
                <div className="grid lg:grid-cols-[2fr_1fr] mt-8 grid-rows-none gap-3">
                    <div id="list" className="col-start-0"> 
                        <ListItem className="flex justify-between px-3 py-6">
                            <Text>Teste</Text>
                            <Button size='sm' variant='outlined'iconLeft='chevron-right' >Gerenciar</Button>
                        </ListItem>
                        <ListItem className="flex justify-between px-3 py-6">
                            <Text>Teste</Text>
                            <Button size='sm' variant='outlined'iconLeft='chevron-right' >Gerenciar</Button>
                        </ListItem>
                        <ListItem className="flex justify-between px-3 py-6">
                            <Text>Teste</Text>
                            <Button size='sm' variant='outlined'iconLeft='chevron-right' >Gerenciar</Button>
                        </ListItem>
                    </div>
                    <div id="Filtros" className="hidden lg:flex flex-col gap-6 col-start-2 px-8 py-6 ">
                        <Text variant="heading-h3" tone="brand">Filtros</Text>
                        <Field label="Curso">
                            <Input placeholder="Todos"/>
                        </Field>
                        <Field label="Turno">
                            <Input placeholder="Todos"/>
                        </Field>
                        <div className="flex gap-3">
                            <Button fullWidth={true} variant='outlined' size='sm'>Restaurar</Button>
                            <Button fullWidth={true} size='sm'>Aplicar</Button>
                        </div>
                    </div>
                </div>
            </div>
            }
        />
    )
}