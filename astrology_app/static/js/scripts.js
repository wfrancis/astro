.ready(function() {
    .on('submit', function(e) {
        e.preventDefault();
        const birthDate = .val();
        const birthTime = .val();
        const location = .val();

        $.ajax({
            url: '/report',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ birth_date: birthDate, birth_time: birthTime, location: location }),
            success: function(data) {
                let reportHtml = '<ul>';
                for (let key in data) {
                    reportHtml += ;
                }
                reportHtml += '</ul>';
                .html(reportHtml);
                .show();
            }
        });
    });

    .on('click', function() {
        .modal('show');
    });

    .on('click', function() {
        const userMessage = .val();
        .append();
        .val('');

        $.ajax({
            url: 'https://api.openai.com/v1/engines/davinci-codex/completions',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
                'Content-Type': 'application/json'
            }),
            data: JSON.stringify({
                prompt: ,
                max_tokens: 150
            }),
            success: function(response) {
                const botMessage = response.choices[0].text.trim();
                .append();
            }
        });
    });
});
