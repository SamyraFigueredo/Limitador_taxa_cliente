const socket = new WebSocket('ws://localhost:8081');

const logDiv = document.getElementById('log');
const buttons = document.querySelectorAll('button.route-btn');

socket.addEventListener('open', () => {
    logMessage('🔌 Conectado ao servidor WebSocket', 'info');
});

socket.addEventListener('message', (event) => {
    try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'limits') {
            // Atualiza o texto fixo das statuses dos botões
            for (const rota in msg.data) {
                const btn = document.querySelector(`button[data-route="${rota}"]`);
                if (btn) {
                    btn.querySelector('span.status').textContent = msg.data[rota];
                }
            }
            logMessage('📊 Limites das rotas atualizados', 'info');
            return;
        }

        if (msg.type === 'status') {
            // Atualiza status dinâmico (se o backend enviar)
            for (const rota in msg.data) {
                const btn = document.querySelector(`button[data-route="${rota}"]`);
                if (btn) {
                    btn.querySelector('span.status').textContent = msg.data[rota];
                }
            }
            return;
        }

        if (msg.type === 'rate_limit_exceeded') {
            logMessage(`🚫 Limite atingido na rota ${msg.rota} pelo IP ${msg.ip}`, 'blocked');
            return;
        }
    } catch {
        // Se não for JSON, mostra como mensagem comum
        if (event.data.toLowerCase().includes('bloqueada')) {
            logMessage('🚫 ' + event.data, 'blocked');
        } else {
            logMessage('✅ ' + event.data, 'accepted');
        }
    }
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            const url = btn.getAttribute('data-url');
            fetch(url)
                .then(res => res.text())
                .then(text => logMessage(`Requisição ${url} → ${text}`, 'accepted'))
                .catch(() => logMessage(`Erro na requisição ${url}`, 'blocked'));
        } else {
            logMessage('⚠️ WebSocket desconectado', 'blocked');
        }
    });
});


function logMessage(message, type = '') {
    const el = document.createElement('div');
    el.textContent = message;
    if (type) el.classList.add(type);
    logDiv.prepend(el);
}
