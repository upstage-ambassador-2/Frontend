export default function InboxLoading() {
  return (
    <div className="page inbox-page" style={{ maxWidth: 1040 }}>
      <div className="row between page-title">
        <div>
          <div className="page-title-text">받은편지함</div>
          <div className="small muted mt-1">
            최근 Gmail 메일을 고르면 작성 화면에서 답장 초안을 만들 수 있습니다.
          </div>
        </div>
      </div>
      <div className="card inbox-card">
        <div className="state-row row gap-2">
          <span className="result-spinner" aria-hidden />
          <span>받은편지함을 불러오는 중입니다.</span>
        </div>
      </div>
    </div>
  );
}
