// Массив слов и переводов
const vocabulary = [
    { english: "to lay upon a sofa", russian: "лежать на диване" },
    { english: "to glimpse", russian: "мельком увидеть" },
    { english: "to labour", russian: "изнурительно уговаривать" },
    { english: "to hail", russian: "окликать" },
    { english: "to row", russian: "грести" },
    { english: "to draw", russian: "утонуть" },
    { english: "to escape", russian: "спасаться бегством" },
    { english: "to put in striking condition", russian: "приукрашивать рассказ разными подробностями" },
    { english: "to push ones head and shoulders through", russian: "просунуть голову и плечи" },
    { english: "to cry of gladness", russian: "плакать от радости" },
    { english: "a speck of daylight", russian: "проблеск дневного света" },
    { english: "twine clew", russian: "моток бочевки" },
    { english: "bassage", russian: "коридор проход" }
];

// Переменные состояния
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;
let mode = 'en-ru'; // 'en-ru' или 'ru-en'
let currentQuestions = [...vocabulary]; // Копия для перемешивания

// Элементы DOM
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const checkButton = document.getElementById('check-btn');
const nextButton = document.getElementById('next-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const switchModeButton = document.getElementById('switch-mode-btn');
const feedback = document.getElementById('feedback');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const scoreElement = document.getElementById('score');
const modeIndicator = document.getElementById('mode-indicator');
const progressBar = document.getElementById('progress-bar');

// Инициализация
function init() {
    totalQuestionsElement.textContent = currentQuestions.length;
    updateScore();
    updateProgressBar();
    shuffleQuestions();
    loadQuestion();
    
    // Обработчики событий
    checkButton.addEventListener('click', checkAnswer);
    nextButton.addEventListener('click', nextQuestion);
    shuffleButton.addEventListener('click', shuffleQuestions);
    switchModeButton.addEventListener('click', switchMode);
}

// Загрузка вопроса
function loadQuestion() {
    isAnswered = false;
    const question = currentQuestions[currentQuestionIndex];
    
    // Устанавливаем вопрос в зависимости от режима
    if (mode === 'en-ru') {
        questionText.textContent = question.english;
    } else {
        questionText.textContent = question.russian;
    }
    
    // Создаем варианты ответов
    createAnswerOptions(question);
    
    // Сбрасываем состояние кнопок
    feedback.className = 'feedback';
    feedback.innerHTML = '<i class="fas fa-lightbulb"></i> Выберите ответ и нажмите "Проверить"';
    checkButton.disabled = false;
    nextButton.disabled = true;
    
    // Обновляем счетчик
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    updateProgressBar();
}

// Создание вариантов ответов
function createAnswerOptions(correctQuestion) {
    // Очищаем контейнер
    answersContainer.innerHTML = '';
    
    // Создаем массив всех переводов (кроме правильного)
    let otherAnswers;
    if (mode === 'en-ru') {
        otherAnswers = vocabulary
            .filter(item => item.russian !== correctQuestion.russian)
            .map(item => item.russian);
    } else {
        otherAnswers = vocabulary
            .filter(item => item.english !== correctQuestion.english)
            .map(item => item.english);
    }
    
    // Перемешиваем неправильные ответы
    otherAnswers = shuffleArray(otherAnswers);
    
    // Берем 3 случайных неправильных ответа
    const wrongAnswers = otherAnswers.slice(0, 3);
    
    // Правильный ответ
    const correctAnswer = mode === 'en-ru' 
        ? correctQuestion.russian 
        : correctQuestion.english;
    
    // Создаем массив всех ответов и перемешиваем
    const allAnswers = [...wrongAnswers, correctAnswer];
    const shuffledAnswers = shuffleArray(allAnswers);
    
    // Создаем кнопки для каждого ответа
    shuffledAnswers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.innerHTML = `<i class="far fa-circle"></i> ${answer}`;
        button.dataset.answer = answer;
        
        button.addEventListener('click', () => selectAnswer(button, shuffledAnswers));
        
        answersContainer.appendChild(button);
    });
}

// Выбор ответа
function selectAnswer(selectedButton, allButtons) {
    if (isAnswered) return;
    
    // Снимаем выделение со всех кнопок
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.querySelector('i').className = 'far fa-circle';
    });
    
    // Выделяем выбранную кнопку
    selectedButton.classList.add('selected');
    selectedButton.querySelector('i').className = 'fas fa-check-circle';
}

// Проверка ответа
function checkAnswer() {
    if (isAnswered) return;
    
    const selectedButton = document.querySelector('.answer-btn.selected');
    if (!selectedButton) {
        feedback.className = 'feedback neutral';
        feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Пожалуйста, выберите ответ!';
        return;
    }
    
    isAnswered = true;
    
    const question = currentQuestions[currentQuestionIndex];
    const correctAnswer = mode === 'en-ru' 
        ? question.russian 
        : question.english;
    
    const userAnswer = selectedButton.dataset.answer;
    const isCorrect = userAnswer === correctAnswer;
    
    // Показываем правильный ответ
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.add('disabled');
        
        if (btn.dataset.answer === correctAnswer) {
            btn.classList.add('correct');
            btn.querySelector('i').className = 'fas fa-check-circle';
        }
        
        if (btn.dataset.answer === userAnswer && !isCorrect) {
            btn.classList.add('incorrect');
            btn.querySelector('i').className = 'fas fa-times-circle';
        }
    });
    
    // Обновляем счет
    if (isCorrect) {
        score++;
        updateScore();
        feedback.className = 'feedback correct';
        feedback.innerHTML = `<i class="fas fa-check-circle"></i> Верно! ${mode === 'en-ru' ? question.english : question.russian} = ${correctAnswer}`;
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `<i class="fas fa-times-circle"></i> Неверно! Правильный ответ: ${correctAnswer}`;
    }
    
    // Активируем кнопку "Дальше"
    checkButton.disabled = true;
    nextButton.disabled = false;
}

// Следующий вопрос
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= currentQuestions.length) {
        // Если вопросы закончились
        currentQuestionIndex = 0;
        feedback.className = 'feedback neutral';
        feedback.innerHTML = `<i class="fas fa-trophy"></i> Тест завершен! Вы ответили правильно на ${score} из ${currentQuestions.length} вопросов. Начинаем заново.`;
        score = 0;
        updateScore();
    }
    
    loadQuestion();
}

// Перемешивание вопросов
function shuffleQuestions() {
    currentQuestions = shuffleArray([...vocabulary]);
    currentQuestionIndex = 0;
    score = 0;
    updateScore();
    loadQuestion();
    
    // Визуальная обратная связь
    shuffleButton.innerHTML = '<i class="fas fa-random"></i> Перемешано!';
    setTimeout(() => {
        shuffleButton.innerHTML = '<i class="fas fa-random"></i> Перемешать';
    }, 1000);
}

// Смена режима (направления перевода)
function switchMode() {
    mode = mode === 'en-ru' ? 'ru-en' : 'en-ru';
    modeIndicator.textContent = mode === 'en-ru' ? 'EN -> RU' : 'RU -> EN';
    currentQuestionIndex = 0;
    score = 0;
    updateScore();
    loadQuestion();
    
    // Визуальная обратная связь
    switchModeButton.innerHTML = `<i class="fas fa-exchange-alt"></i> Режим: ${mode === 'en-ru' ? 'EN->RU' : 'RU->EN'}`;
    setTimeout(() => {
        switchModeButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Сменить направление';
    }, 1500);
}

// Обновление счета
function updateScore() {
    scoreElement.textContent = score;
}

// Обновление прогресс-бара
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Вспомогательная функция для перемешивания массива
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
