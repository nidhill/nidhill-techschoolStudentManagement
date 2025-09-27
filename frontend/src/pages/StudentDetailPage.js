import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStudentDetails as getStudentById, updateStudentDetails, updateStudent, getStudentAttendanceHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { key: 'personalDetails', label: 'Personal Details' },
  { key: 'pointTracker', label: 'Point Tracker' },
  { key: 'review', label: 'Review' },
  { key: 'participation', label: 'Participation' },
  { key: 'linkedinPlanner', label: 'LinkedIn Planner' },
  { key: 'communication', label: 'Communication' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'presentation', label: 'Presentation' }
];

const StudentDetailPage = () => {
  const { studentId } = useParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('personalDetails');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [student, setStudent] = useState(null);

  // Editable slices per tab (avoid mutating the fetched object until save)
  const [courseInfo, setCourseInfo] = useState({ course: '', semester: '', batch: '' });
  const [assignedShoDisplay, setAssignedShoDisplay] = useState('');
  const [pointTracker, setPointTracker] = useState({});
  const [review, setReview] = useState({});
  const [participation, setParticipation] = useState('');
  const [linkedinPlanner, setLinkedinPlanner] = useState({ profileCreation: '', connections: '', posts: '', networking: '' });
  const [communication, setCommunication] = useState('');
  const [attendance, setAttendance] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [attendanceFromDate, setAttendanceFromDate] = useState('');
  const [attendanceToDate, setAttendanceToDate] = useState('');
  const [presentation, setPresentation] = useState({ topic: '', score: '', feedback: '', date: '' });
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    domain: '',
    dateOfBirth: '',
    age: '',
    gender: 'Male',
    photo: '',
    parentDetails: { fatherName:'', fatherContact:'', motherName:'', motherContact:'' },
    guardianDetails: { guardianName:'', guardianRelationship:'', guardianContact:'' },
    address: { houseNo:'', postOffice:'', district:'', pincode:'', village:'', taluk:'' },
    education: { qualification:'', collegeOrSchool:'' },
    workExperience: { hasExperience:false, companyName:'', designation:'' },
    registerNumber: ''
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getStudentById(studentId);
        const s = data?.student || data?.data?.student || data; // tolerate varying shapes
        setStudent(s);
        setCourseInfo({
          course: s?.course || '',
          semester: s?.semester || '',
          batch: s?.batch || ''
        });
        // For SHO users, the assigned SHO is the current user
        setAssignedShoDisplay(user?.fullName || user?.username || 'You');
        setPointTracker({ ...(s?.pointTracker || {}) });
        setReview({ ...(s?.review || {}) });
        setParticipation(s?.participation || '');
        setLinkedinPlanner({ ...(s?.linkedinPlanner || {}) });
        setCommunication(s?.communication || '');
        setAttendance(s?.attendance || '');
        try {
          const histRes = await getStudentAttendanceHistory(studentId);
          setAttendanceHistory(histRes?.history || []);
        } catch (e) {
          setAttendanceHistory([]);
        }
        setPresentation({
          topic: s?.presentation?.topic || '',
          score: s?.presentation?.score || '',
          feedback: s?.presentation?.feedback || '',
          date: s?.presentation?.date ? String(s.presentation.date).substring(0, 10) : ''
        });
        setPersonalForm({
          fullName: s?.fullName || '',
          email: s?.email || '',
          mobileNumber: s?.mobileNumber || '',
          domain: s?.domain || '',
          dateOfBirth: s?.dateOfBirth ? String(s.dateOfBirth).substring(0,10) : '',
          age: s?.age || '',
          gender: s?.gender || 'Male',
          photo: s?.photo || '',
          parentDetails: {
            fatherName: s?.parentDetails?.fatherName || '',
            fatherContact: s?.parentDetails?.fatherContact || '',
            motherName: s?.parentDetails?.motherName || '',
            motherContact: s?.parentDetails?.motherContact || ''
          },
          guardianDetails: {
            guardianName: s?.guardianDetails?.guardianName || '',
            guardianRelationship: s?.guardianDetails?.guardianRelationship || '',
            guardianContact: s?.guardianDetails?.guardianContact || ''
          },
          address: {
            houseNo: s?.address?.houseNo || '',
            postOffice: s?.address?.postOffice || '',
            district: s?.address?.district || '',
            pincode: s?.address?.pincode || '',
            village: s?.address?.village || '',
            taluk: s?.address?.taluk || ''
          },
          education: {
            qualification: s?.education?.qualification || '',
            collegeOrSchool: s?.education?.collegeOrSchool || ''
          },
          workExperience: {
            hasExperience: s?.workExperience?.hasExperience || false,
            companyName: s?.workExperience?.companyName || '',
            designation: s?.workExperience?.designation || ''
          },
          registerNumber: s?.registerNumber || ''
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load student');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await updateStudentDetails(studentId, payload);
      if (res?.success === false) {
        setError(res?.message || 'Save failed');
      } else {
        setSuccess(res?.message || 'Saved');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (payload) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await updateStudent(studentId, payload);
      if (res?.success === false) {
        setError(res?.message || 'Save failed');
      } else {
        setSuccess(res?.message || 'Profile updated');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const renderPersonal = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Assigned SHO</label>
        <input className="w-full border rounded-lg px-3 py-2 bg-gray-100" value={assignedShoDisplay} readOnly />
        <p className="text-xs text-gray-500 mt-1">This student is assigned to your SHO account.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Photo URL</label>
          <div className="flex items-center gap-3">
            <input className="w-full border rounded-lg px-3 py-2" placeholder="https://..." value={personalForm.photo} onChange={(e)=>setPersonalForm(v=>({...v, photo:e.target.value}))} />
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {personalForm.photo ? (
                <img src={personalForm.photo} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-600">No image</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Paste an image URL to set the student's profile photo.</p>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Full Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.fullName} onChange={(e)=>setPersonalForm(v=>({...v, fullName:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input className="w-full border rounded-lg px-3 py-2" type="email" value={personalForm.email} onChange={(e)=>setPersonalForm(v=>({...v, email:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mobile</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.mobileNumber} onChange={(e)=>setPersonalForm(v=>({...v, mobileNumber:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Domain</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.domain} onChange={(e)=>setPersonalForm(v=>({...v, domain:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">DOB</label>
          <input className="w-full border rounded-lg px-3 py-2" type="date" value={personalForm.dateOfBirth} onChange={(e)=>setPersonalForm(v=>({...v, dateOfBirth:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Age</label>
          <input className="w-full border rounded-lg px-3 py-2" type="number" value={personalForm.age} onChange={(e)=>setPersonalForm(v=>({...v, age:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Gender</label>
          <select className="w-full border rounded-lg px-3 py-2" value={personalForm.gender} onChange={(e)=>setPersonalForm(v=>({...v, gender:e.target.value}))}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Register Number</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.registerNumber} onChange={(e)=>setPersonalForm(v=>({...v, registerNumber:e.target.value}))} />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">House No</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.houseNo} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, houseNo:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Post Office</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.postOffice} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, postOffice:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">District</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.district} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, district:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Pincode</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.pincode} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, pincode:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Village</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.village} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, village:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Taluk</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.address.taluk} onChange={(e)=>setPersonalForm(v=>({...v, address:{...v.address, taluk:e.target.value}}))} />
        </div>
      </div>

      {/* Parents & Guardian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Father Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.parentDetails.fatherName} onChange={(e)=>setPersonalForm(v=>({...v, parentDetails:{...v.parentDetails, fatherName:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Father Contact</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.parentDetails.fatherContact} onChange={(e)=>setPersonalForm(v=>({...v, parentDetails:{...v.parentDetails, fatherContact:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mother Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.parentDetails.motherName} onChange={(e)=>setPersonalForm(v=>({...v, parentDetails:{...v.parentDetails, motherName:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mother Contact</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.parentDetails.motherContact} onChange={(e)=>setPersonalForm(v=>({...v, parentDetails:{...v.parentDetails, motherContact:e.target.value}}))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Guardian Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.guardianDetails.guardianName} onChange={(e)=>setPersonalForm(v=>({...v, guardianDetails:{...v.guardianDetails, guardianName:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Relationship</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.guardianDetails.guardianRelationship} onChange={(e)=>setPersonalForm(v=>({...v, guardianDetails:{...v.guardianDetails, guardianRelationship:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Contact</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.guardianDetails.guardianContact} onChange={(e)=>setPersonalForm(v=>({...v, guardianDetails:{...v.guardianDetails, guardianContact:e.target.value}}))} />
        </div>
      </div>

      {/* Education & Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Qualification</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.education.qualification} onChange={(e)=>setPersonalForm(v=>({...v, education:{...v.education, qualification:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">College/School</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.education.collegeOrSchool} onChange={(e)=>setPersonalForm(v=>({...v, education:{...v.education, collegeOrSchool:e.target.value}}))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input id="hasExp" type="checkbox" checked={personalForm.workExperience.hasExperience} onChange={(e)=>setPersonalForm(v=>({...v, workExperience:{...v.workExperience, hasExperience:e.target.checked}}))} />
          <label htmlFor="hasExp" className="text-sm text-gray-700">Has Work Experience</label>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Company Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.workExperience.companyName} onChange={(e)=>setPersonalForm(v=>({...v, workExperience:{...v.workExperience, companyName:e.target.value}}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Designation</label>
          <input className="w-full border rounded-lg px-3 py-2" value={personalForm.workExperience.designation} onChange={(e)=>setPersonalForm(v=>({...v, workExperience:{...v.workExperience, designation:e.target.value}}))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Course</label>
          <input className="w-full border rounded-lg px-3 py-2" value={courseInfo.course} onChange={(e)=>setCourseInfo(v=>({...v, course:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Semester</label>
          <input className="w-full border rounded-lg px-3 py-2" value={courseInfo.semester} onChange={(e)=>setCourseInfo(v=>({...v, semester:e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Batch Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={courseInfo.batch} onChange={(e)=>setCourseInfo(v=>({...v, batch:e.target.value}))} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={async () => {
            const payload = { ...personalForm, ...courseInfo };
            await handleSaveProfile(payload);
          }}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderPointTracker = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => {
          const key = `week${idx + 1}`;
          return (
            <div key={key}>
              <label className="block text-sm text-gray-700 mb-1">{key.toUpperCase()}</label>
              <input type="number" min="0" max="100" className="w-full border rounded-lg px-3 py-2" value={pointTracker?.[key] ?? ''} onChange={(e)=>setPointTracker(v=>({ ...v, [key]: e.target.value === '' ? '' : Number(e.target.value)}))} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button onClick={() => handleSave({ pointTracker })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, idx) => {
        const key = `reviewWeek${idx + 1}`;
        return (
          <div key={key}>
            <label className="block text-sm text-gray-700 mb-1">{`Week ${idx + 1}`}</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={review?.[key] || ''} onChange={(e)=>setReview(v=>({ ...v, [key]: e.target.value }))} />
          </div>
        );
      })}
      <div className="flex justify-end">
        <button onClick={() => handleSave({ review })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  const renderParticipation = () => (
    <div className="space-y-4">
      <textarea className="w-full border rounded-lg px-3 py-2" rows={6} value={participation} onChange={(e)=>setParticipation(e.target.value)} />
      <div className="flex justify-end">
        <button onClick={() => handleSave({ participation })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  const renderLinkedIn = () => (
    <div className="space-y-4">
      {['profileCreation','connections','posts','networking'].map((k)=>(
        <div key={k}>
          <label className="block text-sm text-gray-700 mb-1">{k}</label>
          <input className="w-full border rounded-lg px-3 py-2" value={linkedinPlanner?.[k] || ''} onChange={(e)=>setLinkedinPlanner(v=>({ ...v, [k]: e.target.value }))} />
        </div>
      ))}
      <div className="flex justify-end">
        <button onClick={() => handleSave({ linkedinPlanner })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="space-y-4">
      <textarea className="w-full border rounded-lg px-3 py-2" rows={6} value={communication} onChange={(e)=>setCommunication(e.target.value)} />
      <div className="flex justify-end">
        <button onClick={() => handleSave({ communication })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  const renderAttendance = () => {
    const filtered = attendanceHistory.filter((h) => {
      const statusOk = attendanceStatusFilter === 'all' || h.status === attendanceStatusFilter;
      const d = new Date(h.date);
      const fromOk = !attendanceFromDate || d >= new Date(attendanceFromDate);
      const toOk = !attendanceToDate || d <= new Date(attendanceToDate);
      return statusOk && fromOk && toOk;
    });

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-2">Attendance History</h4>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <select
              className="px-3 py-2 border rounded-lg bg-white"
              value={attendanceStatusFilter}
              onChange={(e) => setAttendanceStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From</label>
              <input type="date" className="px-3 py-2 border rounded-lg" value={attendanceFromDate} onChange={(e)=>setAttendanceFromDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To</label>
              <input type="date" className="px-3 py-2 border rounded-lg" value={attendanceToDate} onChange={(e)=>setAttendanceToDate(e.target.value)} />
            </div>
            {(attendanceStatusFilter !== 'all' || attendanceFromDate || attendanceToDate) && (
              <button
                onClick={()=>{ setAttendanceStatusFilter('all'); setAttendanceFromDate(''); setAttendanceToDate(''); }}
                className="px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filtered?.length ? (
            <div className="overflow-x-auto bg-white border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{String(h.date).substring(0,10)}</td>
                      <td className="px-4 py-2 capitalize">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No attendance records match the filter.</p>
          )}
        </div>
      </div>
    );
  };

  const renderPresentation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Topic</label>
          <input className="w-full border rounded-lg px-3 py-2" value={presentation.topic} onChange={(e)=>setPresentation(v=>({ ...v, topic: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Score</label>
          <input className="w-full border rounded-lg px-3 py-2" value={presentation.score} onChange={(e)=>setPresentation(v=>({ ...v, score: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={presentation.date} onChange={(e)=>setPresentation(v=>({ ...v, date: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Feedback</label>
          <textarea rows={4} className="w-full border rounded-lg px-3 py-2" value={presentation.feedback} onChange={(e)=>setPresentation(v=>({ ...v, feedback: e.target.value }))} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => handleSave({ presentation })} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading student...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student?.fullName || student?.username || 'Student'}</h2>
              <p className="text-gray-600 text-sm">Reg: {student?.registerNumber || '—'} • Course: {student?.course || '—'} • Batch: {student?.batch || '—'}</p>
            </div>
          </div>
          {(success || error) && (
            <div className={`mt-4 px-4 py-3 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {success || error}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="border-b border-gray-200 px-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'personalDetails' && renderPersonal()}
            {activeTab === 'pointTracker' && renderPointTracker()}
            {activeTab === 'review' && renderReview()}
            {activeTab === 'participation' && renderParticipation()}
            {activeTab === 'linkedinPlanner' && renderLinkedIn()}
            {activeTab === 'communication' && renderCommunication()}
            {activeTab === 'attendance' && renderAttendance()}
            {activeTab === 'presentation' && renderPresentation()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;



