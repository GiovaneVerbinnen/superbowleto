import test from 'ava'
import moment from 'moment'
import { createBoleto } from '../../../helpers/boleto'
import { buildHeaders, buildPayload, translateResponseCode } from '../../../../src/providers/bradesco'

test('buildHeaders', (t) => {
  const headers = buildHeaders()

  t.deepEqual(headers, {
    Authorization: 'Basic MTAwMDA1MjU0OmJiRTlYTjhSaE95QTktNzlISFBuYkoxLVFxeTdrem9LR2RSLU5qbWk5Zmc=',
  })
})

test('buildPayload with a cpf number on company_document_number', async (t) => {
  const boleto = await createBoleto()
  const payload = buildPayload(boleto)

  t.deepEqual(payload, {
    merchant_id: '100005254',
    boleto: {
      carteira: '26',
      nosso_numero: boleto.title_id,
      numero_documento: boleto.title_id,
      data_emissao: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD'),
      data_vencimento: moment(boleto.expiration_date).tz('America/Sao_Paulo').format('YYYY-MM-DD'),
      valor_titulo: 2000,
      pagador: {
        nome: 'David Bowie',
        documento: '98154524872',
        tipo_documento: '1',
        endereco: {
          cep: '04551010',
          logradouro: 'Rua Fidêncio Ramos',
          numero: '308',
          complemento: '9º andar, conjunto 91',
          bairro: 'Vila Olímpia',
          cidade: 'São Paulo',
          uf: 'SP',
        },
      },
      informacoes_opcionais: {
        perc_juros: undefined,
        perc_multa_atraso: undefined,
        qtde_dias_juros: 7,
        qtde_dias_multa_atraso: 3,
        valor_juros: 100,
        valor_multa_atraso: 85,
        sacador_avalista: {
          nome: 'Some Company',
          documento: '98154524872',
          tipo_documento: '1',
          endereco: {
            cep: '04547006',
            logradouro: 'Rua Gomes de Carvalho',
            numero: '1609',
            complemento: '6º andar',
            bairro: 'Vila Olimpia',
            cidade: 'São Paulo',
            uf: 'SP',
          },
        },
      },
    },
  })
})

test('buildPayload with a cnpj number on company_document_number', async (t) => {
  const boleto = await createBoleto({
    company_document_number: '98154872000112',
  })
  const payload = buildPayload(boleto)

  t.deepEqual(payload, {
    merchant_id: '100005254',
    boleto: {
      carteira: '26',
      nosso_numero: boleto.title_id,
      numero_documento: boleto.title_id,
      data_emissao: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD'),
      data_vencimento: moment(boleto.expiration_date).tz('America/Sao_Paulo').format('YYYY-MM-DD'),
      valor_titulo: 2000,
      pagador: {
        nome: 'David Bowie',
        documento: '98154524872',
        tipo_documento: '1',
        endereco: {
          cep: '04551010',
          logradouro: 'Rua Fidêncio Ramos',
          numero: '308',
          complemento: '9º andar, conjunto 91',
          bairro: 'Vila Olímpia',
          cidade: 'São Paulo',
          uf: 'SP',
        },
      },
      informacoes_opcionais: {
        perc_juros: undefined,
        perc_multa_atraso: undefined,
        qtde_dias_juros: 7,
        qtde_dias_multa_atraso: 3,
        valor_juros: 100,
        valor_multa_atraso: 85,
        sacador_avalista: {
          nome: 'Some Company',
          documento: '98154872000112',
          tipo_documento: '2',
          endereco: {
            cep: '04547006',
            logradouro: 'Rua Gomes de Carvalho',
            numero: '1609',
            complemento: '6º andar',
            bairro: 'Vila Olimpia',
            cidade: 'São Paulo',
            uf: 'SP',
          },
        },
      },
    },
  })
})

test('translateResponseCode: with a "registered" code', (t) => {
  const response = translateResponseCode({
    data: {
      merchant_id: '80000',
      boleto: {
        nosso_numero: '14692108005',
        numero_documento: '1469210800',
        data_requisicao: '2016-07-22T15:06:40',
        data_registro: '2017-01-22T15:06:40',
      },
      status: {
        codigo: 0,
        mensagem: 'REGISTRO REALIZADO COM SUCESSO',
      },
    },
  })

  t.is(response.status, 'registered')
})

test('translateResponseCode: with a "refused" code', (t) => {
  const response = translateResponseCode({
    data: {
      merchant_id: '80000',
      boleto: {
        nosso_numero: '14692108005',
        numero_documento: '1469210800',
        data_requisicao: '2016-07-22T15:06:40',
        data_registro: '2017-01-22T15:06:40',
      },
      status: {
        codigo: 930057,
        mensagem: 'NOSSO NUMERO INVALIDO',
      },
    },
  })

  t.is(response.status, 'refused')
})

test('translateResponseCode: with a "unknown" code', (t) => {
  const response = translateResponseCode({
    data: {
      merchant_id: '80000',
      boleto: {
        nosso_numero: '14692108005',
        numero_documento: '1469210800',
        data_requisicao: '2016-07-22T15:06:40',
        data_registro: '2017-01-22T15:06:40',
      },
      status: {
        codigo: 8,
      },
    },
  })

  t.is(response.status, 'unknown')
})
