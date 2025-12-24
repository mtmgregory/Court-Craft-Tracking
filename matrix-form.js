// ========================================
// MATRIX TRAINING FORM
// Records skill-based matrix exercises
// ========================================

const MatrixForm = ({ players, onSessionSaved }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    date: window.utils.getLocalDateString(),
    volleyFigure8: '',
    bounceFigure8: '',
    volleySideToSide: '',
    dropTargetBackhand: '',
    dropTargetForehand: '',
    serviceBoxDriveForehand: '',
    serviceBoxDriveBackhand: '',
    cornerVolleys: '',
    beepTest: '',
    ballTransfer: '',
    slalom: ''
  });

  const resetForm = () => {
    setFormData({
      date: window.utils.getLocalDateString(),
      volleyFigure8: '',
      bounceFigure8: '',
      volleySideToSide: '',
      dropTargetBackhand: '',
      dropTargetForehand: '',
      serviceBoxDriveForehand: '',
      serviceBoxDriveBackhand: '',
      cornerVolleys: '',
      beepTest: '',
      ballTransfer: '',
      slalom: ''
    });
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    // Validate form using the validator from services-combined.js
    const validation = window.utils.validators.validateMatrixForm(formData);
    
    if (!validation.valid) {
      const errorMessage = 'Please fix the following errors:\n\n' + 
        validation.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
      alert(errorMessage);
      return;
    }

    setIsSubmitting(true);

    const session = {
      playerId: selectedPlayer,
      playerName: players.find(p => p.id === selectedPlayer)?.name,
      date: formData.date,
      exercises: {
        volleyFigure8: parseFloat(formData.volleyFigure8) || 0,
        bounceFigure8: parseFloat(formData.bounceFigure8) || 0,
        volleySideToSide: parseFloat(formData.volleySideToSide) || 0,
        dropTargetBackhand: parseFloat(formData.dropTargetBackhand) || 0,
        dropTargetForehand: parseFloat(formData.dropTargetForehand) || 0,
        serviceBoxDriveForehand: parseFloat(formData.serviceBoxDriveForehand) || 0,
        serviceBoxDriveBackhand: parseFloat(formData.serviceBoxDriveBackhand) || 0,
        cornerVolleys: parseFloat(formData.cornerVolleys) || 0,
        beepTest: parseFloat(formData.beepTest) || 0,
        ballTransfer: parseFloat(formData.ballTransfer) || 0,
        slalom: parseFloat(formData.slalom) || 0
      }
    };

    try {
      const savedSession = await window.firebaseService.addMatrixSession(session);
      onSessionSaved(savedSession);
      resetForm();
      alert('✅ Matrix session saved successfully!');
    } catch (error) {
      console.error('Error saving matrix session:', error);
      alert('❌ Error saving session: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const exercises = [
    { key: 'volleyFigure8', label: 'Volley Figure 8', icon: '🎯' },
    { key: 'bounceFigure8', label: 'Bounce Figure 8', icon: '⚡' },
    { key: 'volleySideToSide', label: 'Volley Side to Side', icon: '↔️' },
    { key: 'dropTargetBackhand', label: 'Drop Target Backhand', icon: '🎾' },
    { key: 'dropTargetForehand', label: 'Drop Target Forehand', icon: '🎾' },
    { key: 'serviceBoxDriveForehand', label: 'Service Box Drive Forehand', icon: '📦' },
    { key: 'serviceBoxDriveBackhand', label: 'Service Box Drive Backhand', icon: '📦' },
    { key: 'cornerVolleys', label: 'Corner Volleys', icon: '🔲' },
    { key: 'beepTest', label: 'Beep Test', icon: '⏱️' },
    { key: 'ballTransfer', label: 'Ball Transfer', icon: '🔄' },
    { key: 'slalom', label: 'Slalom', icon: '🎿' }
  ];

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h2', { className: 'section-header', key: 'header' }, [
      React.createElement('span', { key: 'icon' }, '🎯'),
      'Record Matrix Session'
    ]),
    React.createElement('div', { className: 'space-y-4', key: 'form' }, [
      // Player Select
      React.createElement('div', { key: 'player' }, [
        React.createElement('label', { key: 'label' }, 'Player'),
        React.createElement('select', {
          key: 'select',
          value: selectedPlayer,
          onChange: (e) => setSelectedPlayer(e.target.value),
          disabled: isSubmitting
        }, [
          React.createElement('option', { value: '', key: 'default' }, 'Select Player...'),
          ...players.map(player =>
            React.createElement('option', { key: player.id, value: player.id }, player.name)
          )
        ])
      ]),
      
      // Date
      React.createElement('div', { key: 'date' }, [
        React.createElement('label', { key: 'label' }, 'Date'),
        React.createElement('input', {
          key: 'input',
          type: 'date',
          value: formData.date,
          onChange: (e) => updateFormData('date', e.target.value),
          disabled: isSubmitting
        })
      ]),
      
      // Info Box
      React.createElement('div', {
        key: 'info',
        style: {
          background: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          color: '#1e40af'
        }
      }, [
        React.createElement('p', {
          key: 'title',
          style: { fontWeight: '600', marginBottom: '0.5rem' }
        }, 'ℹ️ Score Range'),
        React.createElement('p', { key: 'desc' }, 'Enter scores from 0-100 for each exercise. Leave blank if not performed.')
      ]),
      
      // Exercises Grid
      React.createElement('div', { className: 'border-t', key: 'exercises' }, [
        React.createElement('label', { className: 'section-label', key: 'label' }, 'Matrix Exercises (0-100)'),
        React.createElement('div', { className: 'grid-2', key: 'grid' },
          exercises.map(exercise =>
            React.createElement('div', {
              key: exercise.key,
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }
            }, [
              React.createElement('label', {
                key: 'label',
                style: {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }
              }, [
                React.createElement('span', { key: 'icon' }, exercise.icon),
                exercise.label
              ]),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                placeholder: '0-100',
                min: '0',
                max: '100',
                step: '0.1',
                value: formData[exercise.key],
                onChange: (e) => updateFormData(exercise.key, e.target.value),
                disabled: isSubmitting
              })
            ])
          )
        )
      ]),
      
      // Submit Button
      React.createElement('button', {
        key: 'submit',
        onClick: handleSubmit,
        className: 'btn btn-primary',
        disabled: isSubmitting
      }, isSubmitting ? 'Saving...' : 'Save Matrix Session')
    ])
  ]);
};

window.MatrixComponents = { MatrixForm };
console.log('✅ Matrix Form Component loaded');