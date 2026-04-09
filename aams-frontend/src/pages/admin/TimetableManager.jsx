import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, Modal, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const COLORS = ['#4F6EF7','#7C3AED','#06D6A0','#F59E0B','#EF4444','#3B82F6'];

export default function TimetableManager() {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ dayOfWeek:'Monday', course:'', faculty:'', department:'', batch:'', section:'A', startTime:'09:00', endTime:'10:00', room:'' });

  const load = async () => {
    try {
      const [ttRes, cRes, fRes, dRes] = await Promise.all([
        apiClient.get('/timetable'),
        apiClient.get('/courses'),
        apiClient.get('/users?role=faculty&limit=100'),
        apiClient.get('/departments'),
      ]);
      setTimetable(ttRes.data?.timetable || []);
      setCourses(cRes.data?.courses || []);
      setFaculty(fRes.data?.users || []);
      setDepartments(dRes.data?.departments || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/timetable', form);
      setShowModal(false);
      load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this slot?')) return;
    await apiClient.delete(`/timetable/${id}`);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Timetable Manager"
        description="Manage class schedules, assign faculty and rooms"
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Slot</button>}
      />

      {/* Grid View */}
      <div className="card" style={{ padding:24, overflowX:'auto' }}>
        <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>Weekly Timetable</h3>
        <div style={{ display:'grid', gridTemplateColumns:`100px repeat(5,1fr)`, gap:3, minWidth:700 }}>
          <div />
          {DAYS.map(day => (
            <div key={day} style={{ padding:'10px', textAlign:'center', background:'var(--bg-surface-2)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem', color:'var(--text-secondary)' }}>{day}</div>
          ))}
          {['09:00','10:00','11:15','12:15','14:00'].map((time, ti) => (
            <>
              <div key={`l${time}`} style={{ padding:'8px 4px', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12, fontSize:'0.7rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{time}</div>
              {DAYS.map(day => {
                const cls = timetable.find(t => t.dayOfWeek === day && t.startTime === time);
                return (
                  <div key={`${day}${time}`} style={{ padding:3, minHeight:72 }}>
                    {cls ? (
                      <div style={{ height:'100%', padding:'8px 10px', borderRadius:'var(--radius-sm)',
                        background:`${COLORS[ti%COLORS.length]}12`, border:`1px solid ${COLORS[ti%COLORS.length]}30`,
                        borderLeft:`3px solid ${COLORS[ti%COLORS.length]}`, position:'relative' }}>
                        <div style={{ fontSize:'0.72rem', fontWeight:700, color:COLORS[ti%COLORS.length], marginBottom:2 }}>{cls.course?.name}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{cls.batch} Sec {cls.section} · {cls.room}</div>
                        <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cls.faculty?.name}</div>
                        <button className="btn btn-ghost btn-icon" style={{ position:'absolute', top:4, right:4, width:18, height:18, padding:2, color:'var(--brand-danger)' }} onClick={() => handleDelete(cls._id)}><Trash2 size={10} /></button>
                      </div>
                    ) : (
                      <div style={{ height:'100%', minHeight:66, borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                        onClick={() => { setForm(f => ({...f, dayOfWeek:day, startTime:time})); setShowModal(true); }}>
                        <Plus size={14} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Timetable Slot">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="input-group"><label className="input-label">Day</label>
              <select className="input" value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek:e.target.value})}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Course</label>
              <select className="input" value={form.course} onChange={e => setForm({...form, course:e.target.value})}>
                <option value="">Select course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Start Time</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({...form, startTime:e.target.value})} /></div>
            <div className="input-group"><label className="input-label">End Time</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({...form, endTime:e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Faculty</label>
              <select className="input" value={form.faculty} onChange={e => setForm({...form, faculty:e.target.value})}>
                <option value="">Select faculty</option>
                {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Department</label>
              <select className="input" value={form.department} onChange={e => setForm({...form, department:e.target.value})}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Batch</label><input className="input" placeholder="B.Tech CSE 2021" value={form.batch} onChange={e => setForm({...form, batch:e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Room</label><input className="input" placeholder="CR-201" value={form.room} onChange={e => setForm({...form, room:e.target.value})} /></div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Slot'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
