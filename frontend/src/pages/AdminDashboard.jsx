import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaUsers, FaMoneyBillWave, FaBook, FaTrash, FaPlus, FaMinus } from "react-icons/fa";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      setAdmin(data.admin);
      setStats(data.stats);
      setTransactions(data.recentTransactions);

      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    fetchData();
  };

  const handleAssignCourse = async (userId, subjectId) => {
  try {
    await api.post("/admin/assign-course", { userId, subjectId });
    alert("Course assigned successfully");
    fetchData();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to assign course");
  }
};


  const handleRemoveCourse = async (userId, subjectId) => {
    await api.post("/admin/remove-course", { userId, subjectId });
    fetchData();
  };

  if (loading) return <p className="text-center py-5">Loading...</p>;

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>

      {admin && (
        <div className="mb-4">
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
        </div>
      )}

      <div className="row text-center mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <FaUsers className="text-primary fs-2" />
            <h5>Total Students</h5>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <FaBook className="text-success fs-2" />
            <h5>Total Subjects</h5>
            <h3>{stats.totalSubjects}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <FaMoneyBillWave className="text-warning fs-2" />
            <h5>Transactions</h5>
            <h3>{stats.totalTransactions}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <FaMoneyBillWave className="text-success fs-2" />
            <h5>Total Revenue</h5>
            <h3>₹{stats.totalRevenue}</h3>
          </div>
        </div>
      </div>

      <h4 className="fw-bold mb-3">Recent Transactions</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>User</th>
            <th>Subject</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{t.userId?.name}</td>
              <td>{t.subjectId?.name}</td>
              <td>₹{t.amount}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="fw-bold mt-5 mb-3">Manage Users</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Courses</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.purchasedSubjects.map((s) => (
                  <span key={s._id} className="badge bg-success me-1">
                    {s.name}
                  </span>
                ))}
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  <FaTrash />
                </button>
                <button
                  className="btn btn-outline-success btn-sm me-2"
                  onClick={() =>
                    handleAssignCourse(u._id, prompt("Enter Subject ID"))
                  }
                >
                  <FaPlus />
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() =>
                    handleRemoveCourse(u._id, prompt("Enter Subject ID"))
                  }
                >
                  <FaMinus />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
