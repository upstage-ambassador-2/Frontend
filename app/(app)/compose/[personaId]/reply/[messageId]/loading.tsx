export default function ReplyComposeLoading() {
  return (
    <div className="page">
      <div className="reply-context">
        <div>
          <div className="card-h-title">답장 컨텍스트</div>
          <div className="small muted mt-1">메일 원문을 불러오는 중입니다.</div>
        </div>
        <span className="result-spinner" aria-hidden />
      </div>
    </div>
  );
}
