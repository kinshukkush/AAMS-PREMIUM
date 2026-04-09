import { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const COLORS = ['#4F6EF7','#7C3AED','#06D6A0','#F59E0B','#EF4444','#3B82F6'];

export default function FacultyTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    apiClient.get('/timetable')
      .then(res => setTimetable(res.data?.timetable || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="My Timetable"
        description="Your weekly class schedule"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button className={`btn ${view==='week'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setView('week')}>Week View</button>
            <button className={`btn ${view==='list'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setView('list')}>List View</button>
          </div>
        }
      />

      {view === 'week' ? (
        <div className="card" style={{ padding:24, overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:`80px repeat(5,1fr)`, gap:2 }}>
            <div />
            {DAYS.map(day => (
              <div key={day} style={{ padding:'12px 8px', textAlign:'center', borderRadius:'var(--radius-md)',
                background: day===today ? 'var(--gradient-brand)' : 'var(--bg-surface-2)', marginBottom:8 }}>
                <div style={{ fontSize:'0.8rem', fontWeight:700, fontFamily:'var(--font-display)', color: day===today ? 'white' : 'var(--text-secondary)' }}>{day.slice(0,3)}</div>
                {day===today && <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.8)', marginTop:2 }}>Today</div>}
              </div>
            ))}
            {['09:00','10:00','11:15','12:15','14:00','15:00'].map((time, ti) => (
              <div key={`time-row-${ti}`}>
                <div key={`t${time}`} style={{ padding:'8px 0', fontSize:'0.7rem', color:'var(--text-muted)', textAlign:'right', paddingRight:12, display:'flex', alignItems:'center', justifyContent:'flex-end' }}>{time}</div>
                {DAYS.map(day => {
                  const cls = timetable.find(t => t.dayOfWeek===day && t.startTime===time);
                  return (
                    <div key={`${day}${time}`} style={{ minHeight:64, padding:2 }}>
                      {cls ? (
                        <div style={{ height:'100%', padding:'8px 10px', borderRadius:'var(--radius-sm)',
                          background:`${COLORS[ti%COLORS.length]}15`, border:`1px solid ${COLORS[ti%COLORS.length]}30`,
                          borderLeft:`3px solid ${COLORS[ti%COLORS.length]}`, cursor:'pointer' }}
                          onClick={() => navigate('/faculty/mark-attendance')}>
                          <div style={{ fontSize:'0.75rem', fontWeight:700, color:COLORS[ti%COLORS.length], lineHeight:1.2, marginBottom:3 }}>{cls.course?.name}</div>
                          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{cls.batch} Sec {cls.section}</div>
                          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{cls.room}</div>
                        </div>
                      ) : (
                        <div style={{ height:'100%', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)', minHeight:60 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {DAYS.map(day => {
            const dayCls = timetable.filter(t => t.dayOfWeek===day);
            return (
              <div key={day} className="card" style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: dayCls.length ? 14 : 0 }}>
                  <div style={{ padding:'4px 14px', borderRadius:'var(--radius-full)', fontSize:'0.8rem', fontWeight:700, fontFamily:'var(--font-display)',
                    background: day===today ? 'var(--gradient-brand)' : 'var(--bg-surface-2)',
                    color: day===today ? 'white' : 'var(--text-secondary)' }}>{day}</div>
                  {day===today && <span className="badge badge-success">Today</span>}
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'auto' }}>{dayCls.length} classes</span>
                </div>
                {dayCls.length === 0 ? (
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>No classes</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {dayCls.map((cls,i) => (
                      <div key={cls._id} style={{ display:'flex', gap:14, padding:'12px 14px', borderRadius:'var(--radius-md)', background:'var(--bg-surface-2)', alignItems:'center', border:'1px solid var(--border-color)' }}>
                        <div style={{ width:6, height:40, borderRadius:99, flexShrink:0, background:COLORS[i%COLORS.length] }} />
                        <Clock size={14} color="var(--text-muted)" />
                        <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', minWidth:120 }}>{cls.startTime} - {cls.endTime}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{cls.course?.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{cls.batch} Sec {cls.section} · {cls.room}</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/mark-attendance')}>
                          <Play size={12} /> Mark
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {timetable.length === 0 && (
            <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No timetable assigned yet</div>
          )}
        </div>
      )}
    </div>
  );
}
