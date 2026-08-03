<!-- ===== КНОПКИ УПРАВЛЕНИЯ КУБИКОМ ===== -->
<div class="cube-buttons" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
    <!-- По часовой стрелке -->
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
        <button class="cube-btn" data-move="U">U</button>
        <button class="cube-btn" data-move="D">D</button>
        <button class="cube-btn" data-move="L">L</button>
        <button class="cube-btn" data-move="R">R</button>
        <button class="cube-btn" data-move="F">F</button>
        <button class="cube-btn" data-move="B">B</button>
    </div>
    <!-- Против часовой стрелки (со штрихом) -->
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
        <button class="cube-btn" data-move="U'">U'</button>
        <button class="cube-btn" data-move="D'">D'</button>
        <button class="cube-btn" data-move="L'">L'</button>
        <button class="cube-btn" data-move="R'">R'</button>
        <button class="cube-btn" data-move="F'">F'</button>
        <button class="cube-btn" data-move="B'">B'</button>
    </div>
</div>

<style>
    .cube-btn {
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        border: none;
        border-radius: 12px;
        background: #1e2a47;
        color: #fff;
        cursor: pointer;
        transition: all 0.15s ease;
        touch-action: manipulation;
        min-width: 44px; /* удобно для пальцев */
        min-height: 44px;
        box-shadow: 0 4px 0 #0f1520;
    }
    .cube-btn:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 #0f1520;
    }
    .cube-btn:hover {
        background: #2a3a5a;
    }
    /* Вторая строка — чуть другой оттенок для различия */
    .cube-btn[data-move*="'"] {
        background: #3a2a4a;
        box-shadow: 0 4px 0 #1f152a;
    }
    .cube-btn[data-move*="'"]:hover {
        background: #4a3a5a;
    }
</style>