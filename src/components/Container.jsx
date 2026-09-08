export default function Container({ as: Tag = "div", className = "", children }) {
  return (
    <Tag className={`mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}
