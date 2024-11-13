document.getElementById('add-button').onclick = function () {
    var entrada = document.getElementById('entrada').value;

    if (entrada) {
        lastEntry = entrada;

        const errorMsg = document.querySelector('h3[style*="red"]');
        const successMsg = document.querySelector('h3[style*="green"]');
        if (errorMsg) errorMsg.remove();
        if (successMsg) successMsg.remove();

        const highlightedCells = document.querySelectorAll('.highlight');
        highlightedCells.forEach(cell => cell.classList.remove('highlight'));

        var tapeRow = document.getElementById('tape-row');
        tapeRow.innerHTML = '';
        tapeRow.insertCell(0).textContent = '●';

        toggleStepButtons(true, true);

        for (var i = 0; i < entrada.length; i++) {
            tapeRow.insertCell(i + 1).textContent = entrada[i];
        }

        tapeRow.insertCell(entrada.length + 1).textContent = 'β';

        document.getElementById('entrada').value = '';

        document.getElementById('steps-table').innerHTML = `
            <tr>
                <th>Iteração</th>
                <th>Estado Atual</th>
                <th>Símbolo Lido</th>
                <th>Próximo Estado</th>
                <th>Símbolo Escrito</th>
                <th>Direção</th>
                <th>Posição do Cabeçote</th>
            </tr>
        `;
    } else {
        alert('Por favor, digite uma entrada.');
    }
};

function displayMessage(text, color) {
    const msg = document.createElement('h3');
    msg.textContent = text;
    msg.style.color = color;
    document.body.appendChild(msg);
}

var currentIndex = 0;
var currentState = 'q0';
var iteration = 1;
var stepsHistory = [];
var tapeRow = document.getElementById('tape-row');
var cells = tapeRow.getElementsByTagName('td');
var currentHighlight = 0;
var stepBack = false;
const nextStepButton = document.getElementById('next-step-button');
const previousStepButton = document.getElementById('previous-step-button');
const addButton = document.getElementById('add-button');
let lastEntry = '';
let nextPreviousSteps = false;

const transitionTable = {
    'q0': {
        '●': ['q0', '●', 'D'],
        'a': ['q2', 'X', 'D'],
        'b': ['q1', 'X', 'D'],
        'X': ['q0', 'X', 'D'],
        'β': ['q4', 'β', 'D']
    },
    'q1': {
        'a': ['q3', 'X', 'E'],
        'b': ['q1', 'b', 'D'],
        'X': ['q1', 'X', 'D']
    },
    'q2': {
        'a': ['q2', 'a', 'D'],
        'b': ['q3', 'X', 'E'],
        'X': ['q2', 'X', 'D']
    },
    'q3': {
        'a': ['q3', 'a', 'E'],
        'b': ['q3', 'b', 'E'],
        'X': ['q0', 'X', 'D']
    },
    'q4': {}
};

function logStep(iteration, currentState, currentSymbol, nextState, writeSymbol, direction, headPosition) {
    var stepsTable = document.getElementById('steps-table');
    var row = document.createElement('tr');
    row.innerHTML = `
        <td>${iteration}</td>
        <td>${currentState}</td>
        <td>${currentSymbol}</td>
        <td>${nextState}</td>
        <td>${writeSymbol}</td>
        <td>${direction}</td>
        <td>${headPosition}</td>
    `;
    stepsTable.appendChild(row);
    stepsHistory.push({ currentState, currentSymbol, nextState, writeSymbol, direction, headPosition });
}

function highlightLanguageTable(currentState, currentSymbol) {
    var languageTable = document.getElementById('language-table');
    var rows = languageTable.getElementsByTagName('tr');

    Array.from(languageTable.getElementsByClassName('highlight')).forEach(cell => {
        cell.classList.remove('highlight');
    });

    for (var i = 1; i < rows.length; i++) {
        var stateCell = rows[i].getElementsByTagName('td')[0];
        if (stateCell && stateCell.textContent.includes(currentState)) {
            var symbolIndex = Array.from(rows[0].getElementsByTagName('th')).findIndex(th => th.textContent === currentSymbol);


            if (symbolIndex > -1) {
                var cellToHighlight = rows[i].getElementsByTagName('td')[symbolIndex];

                cellToHighlight.classList.add('highlight');
            } else {
                var lastCell = rows[i].getElementsByTagName('td')[rows[i].getElementsByTagName('td').length - 1];
                lastCell.classList.add('highlight');
            }
        }
    }
}

function executeNextStep(executeButton) {
    stepBack = false;

    if (currentIndex > 0 && currentIndex === currentHighlight) {
        cells[currentIndex - 1].classList.remove('highlight');
    } else if (currentIndex < currentHighlight) {
        cells[currentIndex + 1].classList.remove('highlight');
        currentHighlight--;
    }

    var currentSymbol = cells[currentIndex].textContent;

    var transition = transitionTable[currentState][currentSymbol];

    highlightLanguageTable(currentState, cells[currentIndex].textContent);
    cells[currentIndex].classList.add('highlight');

    if (!transition) {
        logStep(iteration, currentState, currentSymbol, 'Erro', '-', '-', currentIndex);
        displayMessage('Erro em ' + (iteration) + ' iterações!', 'red');
        toggleStepButtons(false, true);
        nextPreviousSteps = false;
        return false;
    }

    var [nextState, writeSymbol, direction] = transition;
    cells[currentIndex].textContent = writeSymbol;

    logStep(iteration, currentState, currentSymbol, nextState, writeSymbol, direction, currentIndex);
    currentState = nextState;

    if (currentState === 'q4') {
        if (!executeButton) {
            displayMessage(`Aceito em ${iteration} iterações!`, 'green');
            toggleStepButtons(false, true);
            nextPreviousSteps = false;
        }
        return false;
    }

    iteration++;

    if (direction === 'D') {
        currentIndex++;
        currentHighlight++;
    } else if (direction === 'E') {
        currentIndex--;
    }

    return true;
}


function executePreviousStep(backIteration) {
    if (stepsHistory.length === 0) return;

    if (backIteration) {
        iteration--;
    }

    nextPreviousSteps = false;
    toggleStepButtons(true, true);

    const errorMsg = document.querySelector('h3[style*="red"]');
    const successMsg = document.querySelector('h3[style*="green"]');
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();

    var tapeRow = document.getElementById('tape-row');
    var cells = tapeRow.getElementsByTagName('td');

    cells[currentIndex].classList.remove('highlight');

    var lastStep = stepsHistory.pop();

    iteration--;

    currentIndex = lastStep.headPosition;
    currentHighlight = lastStep.headPosition;
    currentState = lastStep.currentState;

    cells[currentIndex].textContent = lastStep.currentSymbol;

    highlightLanguageTable(currentState, lastStep.currentSymbol);
    cells[currentIndex].classList.add('highlight');

    var stepsTable = document.getElementById('steps-table');
    stepsTable.deleteRow(stepsTable.rows.length - 1);
}

function toggleStepButtons(enableNext, enablePrevious) {
    nextStepButton.disabled = !enableNext;
    previousStepButton.disabled = !enablePrevious;

    if (enableNext) {
        nextStepButton.classList.remove('disabled-button');
        nextStepButton.onclick = function () {
            if (stepBack) {
                iteration++;
            }
            nextPreviousSteps = true;
            executeNextStep(false);
        };
    } else {
        nextStepButton.classList.add('disabled-button');
    }

    if (enablePrevious) {
        previousStepButton.classList.remove('disabled-button');
        previousStepButton.onclick = function () {
            stepBack = true;
            executePreviousStep(nextPreviousSteps);
        };
    } else {
        previousStepButton.classList.add('disabled-button');
    }
}

document.getElementById('execute-button').onclick = function () {
    const errorMsg = document.querySelector('h3[style*="red"]');
    const successMsg = document.querySelector('h3[style*="green"]');
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();

    const highlightedCells = document.querySelectorAll('.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));

    var entrada = lastEntry || 'ababba';

    var tapeRow = document.getElementById('tape-row');
    tapeRow.innerHTML = '';
    tapeRow.insertCell(0).textContent = '●';

    for (var i = 0; i < entrada.length; i++) {
        tapeRow.insertCell(i + 1).textContent = entrada[i];
    }

    tapeRow.insertCell(entrada.length + 1).textContent = 'β';

    stepsHistory = [];

    currentIndex = 0;
    currentHighlight = 0;
    currentState = 'q0';
    iteration = 1;
    // backIteration = false;

    document.getElementById('steps-table').innerHTML = `
    <tr>
        <th>Iteração</th>
        <th>Estado Atual</th>
        <th>Símbolo Lido</th>
        <th>Próximo Estado</th>
        <th>Símbolo Escrito</th>
        <th>Direção</th>
        <th>Posição do Cabeçote</th>
    </tr>
`;

    toggleStepButtons(false, false);
    addButton.disabled = true;
    addButton.classList.add('disabled-button');

    const interval = setInterval(() => {
        const errorOccurred = !executeNextStep(true);

        if (errorOccurred || currentState === 'q4') {
            toggleStepButtons(false, true);
            addButton.disabled = false;
            addButton.classList.remove('disabled-button');
            clearInterval(interval);
            if (currentState === 'q4') {
                displayMessage(`Aceito em ${iteration} iterações!`, 'green');
            }
        }
    }, 900);
};

toggleStepButtons(true, true);