// src/components/UserInfoModal.js
import React, { useState } from "react";

const UserInfoModal = ({ open, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ company: "", employeeId: "", name: "" });
  const [err, setErr] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.company || !form.employeeId || !form.name) {
      setErr("회사/사번/이름 모두 입력!");
      return;
    }
    setErr("");
    onSubmit(form);
  };

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h3 style={{ marginBottom: 18 }}>참여자 정보 입력</h3>
        <input
          placeholder="회사"
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
        />
        <input
          placeholder="사번(ID)"
          value={form.employeeId}
          onChange={(e) =>
            setForm((f) => ({ ...f, employeeId: e.target.value }))
          }
        />
        <input
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={handleSubmit}>확인</button>
          <button
            onClick={onCancel}
            style={{ background: "#eee", color: "#2277ee" }}
          >
            취소
          </button>
        </div>
        {err && <div style={{ color: "#d00" }}>{err}</div>}
      </div>
      <style>{`
        .modal-bg {
          position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; z-index:10000;
        }
        .modal-box {
          background: #fff; border-radius: 14px; box-shadow: 0 2px 16px #b7d6e4aa; padding: 36px 30px 24px; min-width: 300px; display: flex; flex-direction: column; gap: 12px; align-items: center;
        }
        .modal-box input { width: 90%; padding: 8px; margin-bottom: 4px; border:1px solid #c1d3ee; border-radius: 7px; }
        .modal-box button { padding: 9px 18px; border-radius: 8px; border: none; font-weight: bold; }
        .modal-box button:first-child { background: #218fff; color: #fff; margin-right: 8px; }
        .modal-box button:last-child { background: #eee; color: #2277ee; }
      `}</style>
    </div>
  );
};

export default UserInfoModal;
