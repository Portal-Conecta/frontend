export const CHECKLIST_GATEWAY_PREFIX = '/checklist'

const API_GATEWAY_URL_ENV = 'API_GATEWAY_URL'

export function resolveApiGatewayUrl() : string{

    const url = process.env[API_GATEWAY_URL_ENV]

    if (!url) { throw new Error(`${API_GATEWAY_URL_ENV} não configurada`) }

    return url.replace(/\/$/, '')

}

export function checklistGatewayPath(servicePath: string): string {

    const normalized = servicePath.startsWith('/') ? servicePath : `/${servicePath}`
    
    return `${CHECKLIST_GATEWAY_PREFIX}${normalized}`

}



