interface MoodEntry {
  mood_score: number;
  emotion_tags: string[];
  notes?: string;
  voice_transcription?: string;
  created_at: string;
}

interface Goal {
  title: string;
  category: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
}

interface Progress {
  mental_health_score?: number;
  goals_completed_count: number;
  total_goals_count: number;
  mood_entries_count: number;
  achievements?: any;
  month: string;
  year: number;
}

interface Profile {
  full_name?: string;
  age?: number;
  gender?: string;
  health_conditions?: string[];
  emergency_contact?: string;
}

interface CrisisEvent {
  severity: string;
  trigger_type?: string;
  intervention_taken?: string;
  notes?: string;
  created_at: string;
  resolved: boolean;
}

export function generateMedicalReport(data: {
  profile: Profile | null;
  userEmail: string;
  moodEntries: MoodEntry[];
  goals: Goal[];
  progress: Progress[];
  crisisEvents?: CrisisEvent[];
}): string {
  const { profile, userEmail, moodEntries, goals, progress, crisisEvents } = data;
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Calculate mood statistics
  const avgMoodScore = moodEntries.length > 0
    ? (moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length).toFixed(1)
    : 'N/A';

  const recentMoods = moodEntries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  const moodTrend = analyzeMoodTrend(recentMoods);
  
  const commonEmotions = getCommonEmotions(moodEntries);
  
  const completionRate = goals.length > 0
    ? ((goals.filter(g => g.is_completed).length / goals.length) * 100).toFixed(0)
    : '0';

  const latestProgress = progress.length > 0 
    ? progress.sort((a, b) => b.year - a.year || (a.month > b.month ? -1 : 1))[0]
    : null;

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MindCare AI - Medical Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .report-container {
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .chart-container {
      margin: 20px 0;
      page-break-inside: avoid;
    }
    canvas {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
    }
    .header {
      border-bottom: 3px solid #6B73FF;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #6B73FF;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }
    h2 {
      color: #6B73FF;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 30px;
      font-size: 20px;
    }
    h3 {
      color: #555;
      font-size: 16px;
      margin-top: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      padding: 15px;
      background: #f9f9f9;
      border-left: 3px solid #6B73FF;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      color: #333;
    }
    .metric-box {
      background: #f0f7ff;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
      border: 1px solid #d0e7ff;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #6B73FF;
    }
    .trend {
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
    }
    .trend-improving { background: #d4edda; color: #155724; }
    .trend-stable { background: #d1ecf1; color: #0c5460; }
    .trend-declining { background: #f8d7da; color: #721c24; }
    .alert-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .critical-box {
      background: #f8d7da;
      border: 1px solid #dc3545;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      background: #e9ecef;
      border-radius: 4px;
      margin: 2px;
      font-size: 12px;
    }
    .entry-list {
      margin: 15px 0;
    }
    .entry-item {
      padding: 10px;
      margin: 8px 0;
      background: #f9f9f9;
      border-left: 3px solid #6B73FF;
    }
    .entry-date {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .recommendation {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 10px 0;
    }
    @media print {
      body { background: white; }
      .report-container { box-shadow: none; }
      canvas {
        max-width: 100% !important;
        height: auto !important;
        page-break-inside: avoid;
      }
      .chart-container {
        page-break-inside: avoid;
      }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>🧠 MindCare AI - Mental Health Report</h1>
      <div class="subtitle">Generated on: ${reportDate}</div>
      <div class="subtitle">Confidential Medical Document</div>
    </div>

    <h2>Patient Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Full Name</div>
        <div class="info-value">${profile?.full_name || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Age</div>
        <div class="info-value">${profile?.age || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Gender</div>
        <div class="info-value">${profile?.gender || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${userEmail}</div>
      </div>
    </div>

    ${profile?.health_conditions && profile.health_conditions.length > 0 ? `
    <h3>Pre-existing Health Conditions</h3>
    <div>
      ${profile.health_conditions.map(condition => `<span class="badge">${condition}</span>`).join('')}
    </div>
    ` : ''}

    ${profile?.emergency_contact ? `
    <div class="info-item" style="margin-top: 15px;">
      <div class="info-label">Emergency Contact</div>
      <div class="info-value">${profile.emergency_contact}</div>
    </div>
    ` : ''}

    <h2>Mental Health Summary</h2>
    
    <div class="info-grid">
      <div class="metric-box">
        <div class="metric-label">Average Mood Score</div>
        <div class="metric-value">${avgMoodScore}/10</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Total Mood Entries</div>
        <div class="metric-value">${moodEntries.length}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Recent Trend (7 days)</div>
        <div class="trend ${moodTrend.class}">${moodTrend.label}</div>
      </div>
      ${latestProgress ? `
      <div class="metric-box">
        <div class="metric-label">Mental Health Score</div>
        <div class="metric-value">${latestProgress.mental_health_score?.toFixed(1) || 'N/A'}</div>
      </div>
      ` : ''}
    </div>

    ${commonEmotions.length > 0 ? `
    <h3>Frequently Reported Emotions</h3>
    <div>
      ${commonEmotions.map(emotion => `<span class="badge">${emotion}</span>`).join('')}
    </div>
    ` : ''}

    <h2>📊 Visual Analytics</h2>
    
    ${generateMoodTrendChart(moodEntries)}
    
    ${generateEmotionChart(moodEntries)}
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
      ${generateGoalCompletionChart(goals)}
      ${generateProgressChart(progress)}
    </div>

    ${crisisEvents && crisisEvents.length > 0 ? `
    <h2>⚠️ Crisis Events</h2>
    <div class="critical-box">
      <strong>Total Crisis Events: ${crisisEvents.length}</strong>
      <p>Unresolved: ${crisisEvents.filter(e => !e.resolved).length}</p>
    </div>
    <div class="entry-list">
      ${crisisEvents.slice(0, 5).map(event => `
        <div class="entry-item">
          <div class="entry-date">${new Date(event.created_at).toLocaleDateString()} - Severity: ${event.severity}</div>
          ${event.trigger_type ? `<div><strong>Trigger:</strong> ${event.trigger_type}</div>` : ''}
          ${event.intervention_taken ? `<div><strong>Intervention:</strong> ${event.intervention_taken}</div>` : ''}
          ${event.notes ? `<div><strong>Notes:</strong> ${event.notes}</div>` : ''}
          <div><strong>Status:</strong> ${event.resolved ? '✓ Resolved' : '⚠ Requires Follow-up'}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <h2>Recent Mood Entries (Last 7 Days)</h2>
    ${recentMoods.length > 0 ? `
    <div class="entry-list">
      ${recentMoods.map(entry => `
        <div class="entry-item">
          <div class="entry-date">${new Date(entry.created_at).toLocaleDateString()} - Score: ${entry.mood_score}/10</div>
          ${entry.emotion_tags?.length > 0 ? `<div>Emotions: ${entry.emotion_tags.join(', ')}</div>` : ''}
          ${entry.notes ? `<div>Notes: ${entry.notes}</div>` : ''}
          ${entry.voice_transcription ? `<div>Transcription: ${entry.voice_transcription}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : '<p>No recent mood entries available.</p>'}

    <h2>Goal Progress</h2>
    <div class="metric-box">
      <div class="metric-label">Goal Completion Rate</div>
      <div class="metric-value">${completionRate}%</div>
      <div class="metric-label" style="margin-top: 10px;">Completed: ${goals.filter(g => g.is_completed).length} / ${goals.length}</div>
    </div>

    ${goals.length > 0 ? `
    <h3>Recent Goals</h3>
    <div class="entry-list">
      ${goals.slice(0, 10).map(goal => `
        <div class="entry-item">
          <div>${goal.is_completed ? '✓' : '○'} ${goal.title}</div>
          <div class="entry-date">Category: ${goal.category || 'General'} - Created: ${new Date(goal.created_at).toLocaleDateString()}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <h2>Clinical Recommendations for Caregivers & Healthcare Providers</h2>
    
    ${generateClinicalRecommendations(avgMoodScore, moodTrend, crisisEvents || [], moodEntries)}

    <h2>Progress Over Time</h2>
    ${progress.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Period</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Mental Health Score</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Mood Entries</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Goals Completed</th>
        </tr>
      </thead>
      <tbody>
        ${progress.slice(0, 6).map(p => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${p.month} ${p.year}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${p.mental_health_score?.toFixed(1) || 'N/A'}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${p.mood_entries_count}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${p.goals_completed_count} / ${p.total_goals_count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : '<p>No progress data available.</p>'}

    <div class="footer">
      <p><strong>Confidential Information</strong></p>
      <p>This report contains sensitive mental health information and should be handled according to HIPAA guidelines.</p>
      <p>Generated by MindCare AI - Mental Health Support Platform</p>
      <p>For questions or concerns, please contact the patient's emergency contact.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

function analyzeMoodTrend(recentMoods: MoodEntry[]): { label: string; class: string } {
  if (recentMoods.length < 2) {
    return { label: 'Insufficient Data', class: 'trend-stable' };
  }

  const firstHalf = recentMoods.slice(Math.ceil(recentMoods.length / 2));
  const secondHalf = recentMoods.slice(0, Math.ceil(recentMoods.length / 2));

  const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood_score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood_score, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 1) {
    return { label: '↑ Improving', class: 'trend-improving' };
  } else if (diff < -1) {
    return { label: '↓ Declining', class: 'trend-declining' };
  } else {
    return { label: '→ Stable', class: 'trend-stable' };
  }
}

function getCommonEmotions(moodEntries: MoodEntry[]): string[] {
  const emotionCount: Record<string, number> = {};

  moodEntries.forEach(entry => {
    entry.emotion_tags?.forEach(emotion => {
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
  });

  return Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([emotion]) => emotion);
}

function generateClinicalRecommendations(
  avgMoodScore: string, 
  moodTrend: { label: string; class: string },
  crisisEvents: CrisisEvent[],
  moodEntries: MoodEntry[]
): string {
  const recommendations: string[] = [];
  const avgScore = parseFloat(avgMoodScore);

  // Critical recommendations based on crisis events
  if (crisisEvents.length > 0) {
    const unresolvedCrisis = crisisEvents.filter(e => !e.resolved).length;
    if (unresolvedCrisis > 0) {
      recommendations.push(`
        <div class="critical-box">
          <strong>🚨 URGENT:</strong> Patient has ${unresolvedCrisis} unresolved crisis event(s). 
          Immediate psychiatric evaluation recommended. Consider hospitalization if patient poses danger to self or others.
        </div>
      `);
    }
  }

  // Mood score based recommendations
  if (!isNaN(avgScore)) {
    if (avgScore <= 3) {
      recommendations.push(`
        <div class="recommendation">
          <strong>Severe Depression Indicators:</strong> Average mood score of ${avgScore}/10 suggests severe depressive symptoms.
          Recommend immediate referral to psychiatrist for medication evaluation and intensive therapy.
        </div>
      `);
    } else if (avgScore <= 5) {
      recommendations.push(`
        <div class="recommendation">
          <strong>Moderate Depression:</strong> Patient showing signs of moderate depression (score: ${avgScore}/10).
          Consider cognitive behavioral therapy (CBT) and regular psychiatric follow-ups every 2-4 weeks.
        </div>
      `);
    } else if (avgScore <= 7) {
      recommendations.push(`
        <div class="recommendation">
          <strong>Mild Mood Concerns:</strong> Patient experiencing mild mood fluctuations.
          Regular counseling sessions and lifestyle modifications (exercise, sleep hygiene) recommended.
        </div>
      `);
    }
  }

  // Trend-based recommendations
  if (moodTrend.class === 'trend-declining') {
    recommendations.push(`
      <div class="alert-box">
        <strong>⚠️ Declining Trend Detected:</strong> Patient's mood has been declining recently.
        Increase monitoring frequency and consider adjusting treatment plan. Schedule follow-up within 1 week.
      </div>
    `);
  } else if (moodTrend.class === 'trend-improving') {
    recommendations.push(`
      <div class="recommendation">
        <strong>✓ Positive Progress:</strong> Patient showing improvement in mood patterns.
        Continue current treatment approach and reinforce positive behaviors. Monthly follow-ups appropriate.
      </div>
    `);
  }

  // Engagement recommendations
  const recentEntries = moodEntries.filter(e => {
    const entryDate = new Date(e.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  if (recentEntries < 3) {
    recommendations.push(`
      <div class="alert-box">
        <strong>Low Engagement:</strong> Patient has recorded only ${recentEntries} mood entries in the past week.
        Low engagement may indicate worsening symptoms or disinterest. Caregiver check-in recommended.
      </div>
    `);
  }

  // General recommendations
  recommendations.push(`
    <div class="recommendation">
      <strong>General Care Plan:</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Continue regular mental health monitoring through this platform</li>
        <li>Ensure emergency contact is aware and available for crisis situations</li>
        <li>Encourage completion of daily goals for routine and structure</li>
        <li>Monitor for signs of substance abuse or self-harm</li>
        <li>Consider family therapy or caregiver support groups</li>
        <li>Regular physical health check-ups (depression often correlates with physical health)</li>
      </ul>
    </div>
  `);

  return recommendations.join('');
}

function generateMoodTrendChart(moodEntries: MoodEntry[]): string {
  if (moodEntries.length === 0) return '';
  
  const last30Days = moodEntries
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-30);
  
  const labels = last30Days.map(e => 
    new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const data = last30Days.map(e => e.mood_score);
  
  return `
    <div class="chart-container">
      <h3>Mood Trend Over Time</h3>
      <canvas id="moodTrendChart" width="800" height="300"></canvas>
      <script>
        (function() {
          const ctx = document.getElementById('moodTrendChart');
          if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx.getContext('2d'), {
              type: 'line',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                  label: 'Mood Score',
                  data: ${JSON.stringify(data)},
                  borderColor: '#6B73FF',
                  backgroundColor: 'rgba(107, 115, 255, 0.1)',
                  tension: 0.4,
                  fill: true,
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: { 
                    min: 0, 
                    max: 10, 
                    title: { display: true, text: 'Mood Score' },
                    ticks: { stepSize: 1 }
                  },
                  x: { 
                    title: { display: true, text: 'Date' }
                  }
                },
                plugins: {
                  legend: { display: true, position: 'top' },
                  title: { display: false }
                }
              }
            });
          }
        })();
      </script>
    </div>
  `;
}

function generateEmotionChart(moodEntries: MoodEntry[]): string {
  const emotionCount: Record<string, number> = {};
  
  moodEntries.forEach(entry => {
    entry.emotion_tags?.forEach(emotion => {
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
  });
  
  const sortedEmotions = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  if (sortedEmotions.length === 0) return '';
  
  const labels = sortedEmotions.map(([emotion]) => emotion);
  const data = sortedEmotions.map(([, count]) => count);
  
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
  
  return `
    <div class="chart-container">
      <h3>Most Common Emotions</h3>
      <canvas id="emotionChart" width="800" height="300"></canvas>
      <script>
        (function() {
          const ctx = document.getElementById('emotionChart');
          if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx.getContext('2d'), {
              type: 'bar',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                  label: 'Frequency',
                  data: ${JSON.stringify(data)},
                  backgroundColor: ${JSON.stringify(colors.slice(0, labels.length))},
                  borderWidth: 0
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Count' },
                    ticks: { stepSize: 1 }
                  }
                },
                plugins: {
                  legend: { display: false },
                  title: { display: false }
                }
              }
            });
          }
        })();
      </script>
    </div>
  `;
}

function generateGoalCompletionChart(goals: Goal[]): string {
  if (goals.length === 0) return '';
  
  const completed = goals.filter(g => g.is_completed).length;
  const incomplete = goals.length - completed;
  
  return `
    <div class="chart-container">
      <h3>Goal Completion Status</h3>
      <canvas id="goalChart" width="400" height="300"></canvas>
      <script>
        (function() {
          const ctx = document.getElementById('goalChart');
          if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx.getContext('2d'), {
              type: 'doughnut',
              data: {
                labels: ['Completed', 'In Progress'],
                datasets: [{
                  data: [${completed}, ${incomplete}],
                  backgroundColor: ['#4CAF50', '#FFC107'],
                  borderWidth: 0
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: false }
                }
              }
            });
          }
        })();
      </script>
    </div>
  `;
}

function generateProgressChart(progress: Progress[]): string {
  if (progress.length === 0) return '';
  
  const last6Months = progress
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    })
    .slice(-6);
  
  const labels = last6Months.map(p => `${p.month.substring(0, 3)} ${p.year}`);
  const moodData = last6Months.map(p => p.mood_entries_count);
  const goalData = last6Months.map(p => p.goals_completed_count);
  
  return `
    <div class="chart-container">
      <h3>6-Month Progress Overview</h3>
      <canvas id="progressChart" width="400" height="300"></canvas>
      <script>
        (function() {
          const ctx = document.getElementById('progressChart');
          if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx.getContext('2d'), {
              type: 'bar',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [
                  {
                    label: 'Mood Entries',
                    data: ${JSON.stringify(moodData)},
                    backgroundColor: '#6B73FF'
                  },
                  {
                    label: 'Goals Completed',
                    data: ${JSON.stringify(goalData)},
                    backgroundColor: '#4CAF50'
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: { 
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                },
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false }
                }
              }
            });
          }
        })();
      </script>
    </div>
  `;
}
