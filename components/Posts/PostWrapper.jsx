function PostWrapper ({ children, className }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg py-2 relative ${className}`}>
      {children}
    </div>
  )
}

export default PostWrapper
