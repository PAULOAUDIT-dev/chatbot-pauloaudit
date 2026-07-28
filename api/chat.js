export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });

  const API_KEY = process.env.CHATBOT_API_KEY;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Você é o Assistente PauloAudit, especialista em concursos públicos brasileiros focado na área de controle, auditoria e fiscalização.\n\nResponda SEMPRE em português brasileiro de forma clara, objetiva e profissional.\n\nSuas fontes de referência são:\n- https://www.estrategiaconcursos.com.br/blog/noticias/\n- https://blog.grancursosonline.com.br/\n- https://www.direcaoconcursos.com.br/noticias\n- https://www.concursosnobrasil.com.br/\n- https://www.pciconcursos.com.br/\n- https://www.qconcursos.com/\n\nVocê responde sobre:\n- Concursos públicos abertos e previstos (editais, datas, inscrições, resultados)\n- Bancas organizadoras (CESPE, FCC, FGV, VUNESP, IADES, QUADRIX)\n- Salários e cargos (Auditor, Fiscal, Controle Interno, Analista)\n- Dicas de estudo para concursos\n- Legislação e normas cobradas em provas\n- AFO, Auditoria, Controle Externo, TI para concursos\n\nRegras:\n- Seja direto e objetivo\n- Se não souber algo com certeza, diga que recomenda verificar no site oficial\n- Sempre mencione a fonte quando citar informações específicas\n- Máximo 3 parágrafos por resposta\n- Use emojis com moderação para tornar a leitura mais agradável`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.2,
        search_domain_filter: [
          'estrategiaconcursos.com.br',
          'grancursosonline.com.br',
          'direcaoconcursos.com.br',
          'concursosnobrasil.com.br',
          'pciconcursos.com.br',
          'qconcursos.com'
        ],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Não consegui obter uma resposta. Tente novamente.';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Erro no chatbot:', error);
    return res.status(500).json({
      reply: '⚠️ Ocorreu um erro ao processar sua pergunta. Tente novamente em instantes.'
    });
  }
}
