document.addEventListener('DOMContentLoaded', function () {
    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const monthYearSpan = document.getElementById('monthYear');
    const daysContainer = document.getElementById('days');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const dateInput = document.getElementById('dateInput');
    const noteInput = document.getElementById('noteInput');
    const saveNoteBtn = document.getElementById('saveNote');

    let currentDate = new Date();
    let selectedDate = null;
    let notes = {}; // Objeto para armazenar lembretes

    // Define feriados e seus nomes
    let holidays = {
        '2024-01-01': 'Ano Novo',
        '2024-02-12': 'Carnaval',
        '2024-02-13': 'Carnaval',
        '2024-03-29': 'Sexta-feira Santa',
        '2024-04-21': 'Tiradentes',
        '2024-05-01': 'Dia do Trabalho',
        '2024-06-20': 'Corpus Christi',
        '2024-09-07': 'Independência do Brasil',
        '2024-10-12': 'Nossa Senhora Aparecida',
        '2024-11-01': 'Todos os Santos',
        '2024-11-15': 'Proclamação da República',
        '2024-12-25': 'Natal'
    };

    function generateHolidayForYear(year) {
        let yearHolidays = {};
        for (const [date, name] of Object.entries(holidays)) {
            const holidayDate = new Date(date);
            holidayDate.setFullYear(year);
            const holidayDateString = holidayDate.toISOString().split('T')[0];
            yearHolidays[holidayDateString] = name;
        }
        return yearHolidays;
    }

    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const allHolidays = {};

        // Gerar feriados para o ano atual e os próximos anos (ajuste conforme necessário)
        for (let i = -1; i <= 1; i++) { // Ajuste o intervalo para mais anos se necessário
            Object.assign(allHolidays, generateHolidayForYear(year + i));
        }

        monthYearSpan.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        daysContainer.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Adiciona espaços vazios para alinhar o primeiro dia do mês
        for (let i = 0; i < firstDay; i++) {
            daysContainer.innerHTML += `<div class="day"></div>`;
        }

        // Adiciona os dias do mês
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0]; // Formata a data como yyyy-mm-dd
            const noteText = notes[dateString] || ''; // Obtém as notas do objeto notes
            const holidayName = allHolidays[dateString];
            const isHoliday = Boolean(holidayName);

            daysContainer.innerHTML += `
                <div class="day ${isHoliday ? 'holiday' : ''}" data-date="${dateString}">
                    <div class="day-number ${isHoliday ? 'holiday-day-number' : ''}">
                        ${day}
                    </div>
                    <div class="note ${isHoliday ? 'holiday-note' : ''}">
                        ${isHoliday ? holidayName : noteText}
                    </div>
                </div>`;
        }

        document.querySelectorAll('.day').forEach(dayElement => {
            dayElement.addEventListener('click', function () {
                const day = this;
                const dateStr = day.getAttribute('data-date');
                selectedDate = new Date(dateStr + 'T00:00:00'); // Adiciona o horário para evitar problemas de fuso horário

                // Verifique se selectedDate é uma data válida
                if (isNaN(selectedDate.getTime())) {
                    console.error('Data inválida:', dateStr);
                    return;
                }

                dateInput.value = selectedDate.toLocaleDateString(); // Ajuste aqui
                noteInput.value = day.querySelector('.note').textContent.trim();
                
                // Não permita edição de notas em feriados
                if (!day.classList.contains('holiday')) {
                    modal.style.display = 'flex';
                } else {
                    alert('Este é um feriado. Não é possível adicionar ou editar notas neste dia.');
                }
            });
        });
    }

    function updateDate(year, month) {
        currentDate = new Date(year, month);
        updateCalendar();
    }

    prevYearBtn.addEventListener('click', function () {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        updateDate(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextYearBtn.addEventListener('click', function () {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        updateDate(currentDate.getFullYear(), currentDate.getMonth());
    });

    prevMonthBtn.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateDate(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateDate(currentDate.getFullYear(), currentDate.getMonth());
    });

    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    saveNoteBtn.addEventListener('click', function () {
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            const noteText = noteInput.value.trim();

            if (noteText) {
                notes[dateString] = noteText; // Salva o lembrete no objeto
                saveNotes(); // Salva no localStorage

                // Atualiza a visualização do lembrete no calendário
                const dayElement = document.querySelector(`.day[data-date="${dateString}"] .note`);
                if (dayElement) {
                    dayElement.textContent = noteText;
                }

                noteInput.value = ''; // Limpa o campo de texto
                modal.style.display = 'none'; // Fecha o modal
            } else {
                alert('Por favor, insira um lembrete.');
            }
        }
    });

    function loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
        }
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    document.addEventListener('mousemove', function (event) {
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;

        const color1 = `hsl(${x * 360}, 100%, 75%)`; // Cor 1
        const color2 = `hsl(${y * 360}, 100%, 75%)`; // Cor 2

        document.body.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
    });

    // Carregar lembretes e inicializar o calendário
    loadNotes();
    updateCalendar();
});
