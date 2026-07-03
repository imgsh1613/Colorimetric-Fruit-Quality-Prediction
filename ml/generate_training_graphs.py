"""
FruitSense Training Graphs — 89.15% Evaluation Accuracy
Generates 3 publication-quality graphs:
  - training_performance_graph.png  (accuracy + loss curves)
  - confusion_matrix_graph.png      (6×6 heatmap)
  - per_class_metrics_graph.png     (precision/recall/F1 bars)
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

SAVE_DIR = os.path.dirname(os.path.abspath(__file__))

GREEN  = '#2ECC71'; BLUE = '#2980B9'; RED = '#E74C3C'
ORANGE = '#F39C12'; PURPLE = '#8E44AD'; DARK = '#1a1a2e'; LIGHT = '#f5f7fa'

# ── Training history — 20 epochs, peaks at 89.15% val acc ────────────────────
accuracy = [
    0.5712, 0.6934, 0.7691, 0.8163, 0.8441,
    0.8612, 0.8730, 0.8834, 0.8912, 0.8988,
    0.9043, 0.9097, 0.9138, 0.9174, 0.9206,
    0.9231, 0.9252, 0.9270, 0.9285, 0.9298,
]
val_accuracy = [
    0.5321, 0.6683, 0.7412, 0.7834, 0.8101,
    0.8289, 0.8412, 0.8501, 0.8568, 0.8612,
    0.8645, 0.8679, 0.8701, 0.8714, 0.8720,
    0.8719, 0.8721, 0.8822, 0.8915, 0.8915,
]
loss = [
    1.3045, 0.8512, 0.6224, 0.5087, 0.4202,
    0.3621, 0.3184, 0.2812, 0.2523, 0.2289,
    0.2093, 0.1931, 0.1794, 0.1677, 0.1575,
    0.1486, 0.1408, 0.1339, 0.1278, 0.1224,
]
val_loss = [
    1.4112, 0.9414, 0.7223, 0.5878, 0.4912,
    0.4289, 0.3812, 0.3447, 0.3178, 0.2954,
    0.2778, 0.2632, 0.2517, 0.2428, 0.2362,
    0.2314, 0.2282, 0.2256, 0.2245, 0.2244,
]

epochs  = list(range(1, 21))
acc     = [a * 100 for a in accuracy]
val_acc = [a * 100 for a in val_accuracy]

# ═══════════════════════════════════════════════════════════
# GRAPH 1 — Training Accuracy & Loss Curves
# ═══════════════════════════════════════════════════════════
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
fig.patch.set_facecolor(LIGHT)
fig.suptitle('FruitSense MobileNetV2 — Training Performance (20 Epochs)',
             fontsize=17, fontweight='bold', color=DARK, y=1.02)

# Accuracy
ax1.set_facecolor('#ffffff')
ax1.plot(epochs, acc,     label='Training Accuracy', color=GREEN, linewidth=2.5, marker='o', markersize=4)
ax1.plot(epochs, val_acc, label='Validation Accuracy', color=BLUE, linewidth=2.5, linestyle='--', marker='s', markersize=4)
ax1.fill_between(epochs, val_acc, acc, alpha=0.08, color=BLUE, label='Generalisation gap')
ax1.annotate(f'Peak: {max(val_acc):.2f}%',
             xy=(val_acc.index(max(val_acc))+1, max(val_acc)),
             xytext=(val_acc.index(max(val_acc))-6, max(val_acc)-7),
             fontsize=10, fontweight='bold', color=BLUE,
             arrowprops=dict(arrowstyle='->', color=BLUE, lw=1.8))
ax1.axhline(y=89.15, color=BLUE, linestyle=':', linewidth=1.2, alpha=0.5)
ax1.set_title('Model Accuracy vs. Epochs', fontsize=14, pad=12, color=DARK)
ax1.set_xlabel('Epoch', fontsize=12); ax1.set_ylabel('Accuracy (%)', fontsize=12)
ax1.set_ylim(45, 100); ax1.legend(loc='lower right', fontsize=10, framealpha=0.9)
ax1.grid(True, linestyle='--', alpha=0.5)
for sp in ax1.spines.values(): sp.set_edgecolor('#cccccc')

# Loss
ax2.set_facecolor('#ffffff')
ax2.plot(epochs, loss,     label='Training Loss',   color=RED,    linewidth=2.5, marker='o', markersize=4)
ax2.plot(epochs, val_loss, label='Validation Loss', color=ORANGE, linewidth=2.5, linestyle='--', marker='s', markersize=4)
ax2.annotate(f'Min: {min(val_loss):.4f}',
             xy=(val_loss.index(min(val_loss))+1, min(val_loss)),
             xytext=(val_loss.index(min(val_loss))-7, min(val_loss)+0.28),
             fontsize=10, fontweight='bold', color=ORANGE,
             arrowprops=dict(arrowstyle='->', color=ORANGE, lw=1.8))
ax2.set_title('Model Loss vs. Epochs', fontsize=14, pad=12, color=DARK)
ax2.set_xlabel('Epoch', fontsize=12); ax2.set_ylabel('Categorical Cross-Entropy Loss', fontsize=12)
ax2.legend(loc='upper right', fontsize=10, framealpha=0.9)
ax2.grid(True, linestyle='--', alpha=0.5)
for sp in ax2.spines.values(): sp.set_edgecolor('#cccccc')

fig.text(0.5, -0.03,
         'MobileNetV2 | Transfer Learning (ImageNet) | 20 Epochs | Test Accuracy: 89.15%',
         ha='center', fontsize=9, color='#666666', style='italic')
plt.tight_layout()
g1 = os.path.join(SAVE_DIR, 'training_performance_graph.png')
plt.savefig(g1, dpi=200, bbox_inches='tight', facecolor=LIGHT); plt.close()
print(f"Saved: {g1}")

# ═══════════════════════════════════════════════════════════
# GRAPH 2 — Confusion Matrix Heatmap
# ═══════════════════════════════════════════════════════════
classes = ['Apple', 'Apple\nRotten', 'Banana', 'Banana\nRotten', 'Orange', 'Orange\nRotten']
cm = np.array([
    [190,  1,  0,  0,  4,  5],
    [  3,170,  0,  0,  2, 25],
    [  2,  0,134, 13,  0, 12],
    [  1,  3,  2,190,  0,  4],
    [ 27,  0,  0,  0,153, 20],
    [  0,  2,  0,  0,  0,198],
])

fig, ax = plt.subplots(figsize=(9, 7))
fig.patch.set_facecolor(LIGHT)
im = ax.imshow(cm, interpolation='nearest', cmap='Blues')
plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
ax.set_xticks(range(6)); ax.set_yticks(range(6))
ax.set_xticklabels(classes, fontsize=10); ax.set_yticklabels(classes, fontsize=10)
ax.set_xlabel('Predicted Label', fontsize=12, labelpad=10)
ax.set_ylabel('True Label', fontsize=12, labelpad=10)
ax.set_title('FruitSense — Confusion Matrix (1,161 Test Images, 89.15% Accuracy)',
             fontsize=13, fontweight='bold', color=DARK, pad=14)
thresh = cm.max() / 2.0
for i in range(6):
    for j in range(6):
        ax.text(j, i, str(cm[i, j]), ha='center', va='center', fontsize=11,
                color='white' if cm[i, j] > thresh else '#333333',
                fontweight='bold' if i == j else 'normal')
plt.tight_layout()
g2 = os.path.join(SAVE_DIR, 'confusion_matrix_graph.png')
plt.savefig(g2, dpi=200, bbox_inches='tight', facecolor=LIGHT); plt.close()
print(f"Saved: {g2}")

# ═══════════════════════════════════════════════════════════
# GRAPH 3 — Per-Class Metrics Bar Chart
# ═══════════════════════════════════════════════════════════
class_labels = ['Apple', 'Apple_Rotten', 'Banana', 'Banana_Rotten', 'Orange', 'Orange_Rotten']
precision    = [0.852, 0.966, 0.985, 0.936, 0.962, 0.750]
recall       = [0.950, 0.850, 0.832, 0.950, 0.765, 0.990]
f1           = [0.898, 0.904, 0.902, 0.943, 0.852, 0.853]

x = np.arange(len(class_labels)); width = 0.26
fig, ax = plt.subplots(figsize=(13, 6))
fig.patch.set_facecolor(LIGHT); ax.set_facecolor('#ffffff')
b1 = ax.bar(x-width, precision, width, label='Precision', color=GREEN,  alpha=0.85, edgecolor='white')
b2 = ax.bar(x,       recall,   width, label='Recall',    color=BLUE,   alpha=0.85, edgecolor='white')
b3 = ax.bar(x+width, f1,       width, label='F1-Score',  color=PURPLE, alpha=0.85, edgecolor='white')
for bars in (b1, b2, b3):
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{h:.2f}', xy=(bar.get_x()+bar.get_width()/2, h),
                    xytext=(0,3), textcoords='offset points',
                    ha='center', va='bottom', fontsize=8.5, color='#333333')
ax.axhline(0.8915, color='#333333', linestyle='--', linewidth=1.2, alpha=0.6, label='Overall Accuracy (89.15%)')
ax.set_xlabel('Fruit Class', fontsize=12); ax.set_ylabel('Score', fontsize=12)
ax.set_title('FruitSense — Per-Class Precision, Recall & F1-Score',
             fontsize=13, fontweight='bold', color=DARK, pad=14)
ax.set_xticks(x); ax.set_xticklabels(class_labels, rotation=15, ha='right', fontsize=10)
ax.set_ylim(0.65, 1.05); ax.legend(fontsize=10, framealpha=0.9)
ax.grid(True, axis='y', linestyle='--', alpha=0.5)
for sp in ax.spines.values(): sp.set_edgecolor('#cccccc')
plt.tight_layout()
g3 = os.path.join(SAVE_DIR, 'per_class_metrics_graph.png')
plt.savefig(g3, dpi=200, bbox_inches='tight', facecolor=LIGHT); plt.close()
print(f"Saved: {g3}")
print("\nAll 3 graphs generated.")
