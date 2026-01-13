/**
 * LoopSettingsModal.jsx - Loop Mode Settings
 * Modal with pedagogical presets for loop practice
 */

import React, { useState } from 'react';
import { X, Settings, Check } from 'lucide-react';
import { LOOP_PRESETS, LOOP_MODE_CONFIG } from '../../config/uiConfig.js';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {number} props.currentTempo - Current tempo value
 * @param {number} props.currentLoopLength - Current loop length
 * @param {string} props.currentSubdivision - Current subdivision
 * @param {Function} props.onApplyPreset - Apply preset callback
 */
export default function LoopSettingsModal({
  isOpen,
  onClose,
  currentTempo = 100,
  currentLoopLength = 1,
  currentSubdivision = 'eighth',
  onApplyPreset,
}) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customSettings, setCustomSettings] = useState({
    tempo: currentTempo,
    loopLength: currentLoopLength,
    subdivision: currentSubdivision,
  });

  if (!isOpen) return null;

  const presets = Object.values(LOOP_PRESETS);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setCustomSettings({
        tempo: preset.tempo,
        loopLength: preset.loopLength,
        subdivision: preset.subdivision,
      });
    }
  };

  const handleApply = () => {
    const preset = LOOP_PRESETS[selectedPreset];
    if (selectedPreset === 'custom') {
      onApplyPreset?.(customSettings);
    } else if (preset) {
      onApplyPreset?.({
        tempo: preset.tempo,
        loopLength: preset.loopLength,
        subdivision: preset.subdivision,
      });
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const subdivisionLabels = {
    quarter: 'Negras (♩)',
    eighth: 'Corcheas (♪)',
    triplet: 'Tresillos (♫³)',
    sixteenth: 'Semicorcheas (♬)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeInUp"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loop-settings-title"
    >
      <div
        className="w-full max-w-lg glass-strong rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-primary-medium)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
              <Settings className="w-5 h-5 text-[var(--color-primary-deep)]" />
            </div>
            <div>
              <h2 id="loop-settings-title" className="font-bold text-[var(--color-cream)]">
                Ajustes de Loop
              </h2>
              <p className="text-xs text-[var(--color-primary-light)]">
                Selecciona un preset o personaliza
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-primary-medium)] transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-[var(--color-primary-light)]" />
          </button>
        </div>

        {/* Preset Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={`
                p-4 rounded-xl text-left transition-all duration-150
                border-2
                ${selectedPreset === preset.id
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-[var(--color-primary-medium)]/30 bg-[var(--color-primary-dark)]/50 hover:border-[var(--color-primary-light)]/50'
                }
              `}
              aria-pressed={selectedPreset === preset.id}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {preset.icon}
                </span>
                <span className="font-semibold text-[var(--color-cream)]">
                  {preset.name}
                </span>
                {selectedPreset === preset.id && (
                  <Check className="w-4 h-4 text-[var(--color-gold)] ml-auto" />
                )}
              </div>
              <p className="text-xs text-[var(--color-primary-light)]">
                {preset.description}
              </p>
              {preset.id !== 'custom' && (
                <div className="mt-2 text-xs font-mono text-[var(--color-gold)]">
                  {preset.tempo} BPM • {preset.loopLength}c • {preset.subdivision}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Settings (shown when custom is selected) */}
        {selectedPreset === 'custom' && (
          <div className="px-4 pb-4 space-y-3">
            <div className="p-4 rounded-xl bg-[var(--color-primary-dark)]/50 border border-[var(--color-primary-medium)]/30">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] mb-3">
                Configuración Personalizada
              </h3>
              
              {/* Tempo */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-[var(--color-primary-light)]">Tempo (BPM)</label>
                <input
                  type="number"
                  min={40}
                  max={200}
                  value={customSettings.tempo}
                  onChange={(e) => setCustomSettings(prev => ({
                    ...prev,
                    tempo: Math.max(40, Math.min(200, parseInt(e.target.value) || 60))
                  }))}
                  className="w-20 px-3 py-1.5 rounded-lg bg-[var(--color-primary-medium)]/50 text-[var(--color-cream)] text-center font-mono border border-[var(--color-primary-light)]/20 focus:border-[var(--color-gold)] outline-none"
                />
              </div>
              
              {/* Loop Length */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-[var(--color-primary-light)]">Compases</label>
                <div className="flex gap-1">
                  {[1, 2, 4].map((len) => (
                    <button
                      key={len}
                      onClick={() => setCustomSettings(prev => ({ ...prev, loopLength: len }))}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${customSettings.loopLength === len
                          ? 'bg-[var(--color-gold)] text-[var(--color-primary-deep)]'
                          : 'bg-[var(--color-primary-medium)]/50 text-[var(--color-primary-light)] hover:bg-[var(--color-primary-medium)]'
                        }
                      `}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Subdivision */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-[var(--color-primary-light)]">División</label>
                <select
                  value={customSettings.subdivision}
                  onChange={(e) => setCustomSettings(prev => ({ ...prev, subdivision: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary-medium)]/50 text-[var(--color-cream)] border border-[var(--color-primary-light)]/20 focus:border-[var(--color-gold)] outline-none"
                >
                  {LOOP_MODE_CONFIG.subdivisions.map((sub) => (
                    <option key={sub} value={sub}>
                      {subdivisionLabels[sub]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-primary-medium)]/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] font-medium hover:bg-[var(--color-primary-medium)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedPreset}
            className={`
              flex-1 py-3 rounded-xl font-bold transition-all
              ${selectedPreset
                ? 'gradient-gold text-[var(--color-primary-deep)] hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-[var(--color-primary-medium)] text-[var(--color-primary-light)] cursor-not-allowed opacity-50'
              }
            `}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
