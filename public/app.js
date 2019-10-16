const toCurrency = price => {
    return new Intl.NumberFormat('en-PL', {
        currency: 'usd',
        style: 'currency'
    }).format(price);
};

const toDate = date => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(date));
};

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent);
});
document.querySelectorAll('.js-date').forEach(node => {
    node.textContent = toDate(node.textContent);
});

const $card = document.getElementById('card');

if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-del-product')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;

            fetch('/card/delete/' + id, {
                method: 'delete',
                // body: JSON.stringify({
                //     _csrf: csrf
                // })
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            })
            .then(res => res.json())
            .then(card => {
                if (card.products.length) {
                    const html = card.products.map(p => {
                        console.log('.....', p);
                        return `
                        <tr>
                            <td>${p.title}</td>
                            <td>${p.count}</td>
                            <td>
                                <button class="btn btn-small js-del-product" 
                                    data-id=${p.id}
                                    data-csrf=${csrf}
                                >Delete</button>
                            </td>
                        </tr>
                        `;
                    }).join('');
                    $card.querySelector('tbody').innerHTML = html;
                    $card.querySelector('.price').textContent = toCurrency(card.price);
                } else {
                    $card.innerHTML = '<p>You don\'t choose any products</p>'
                }
            });
        }
    });
}

var instance = M.Tabs.init(document.querySelectorAll('.tabs'));