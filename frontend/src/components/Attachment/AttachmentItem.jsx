function AttachmentItem({ attachment }) {
  return (
    <img
      src={`http://localhost:8080/${attachment.filePath}`}
      width="200"
    />
  );
}