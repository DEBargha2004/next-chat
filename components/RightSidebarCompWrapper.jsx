function RightSidebarCompWrapper({ children, disablePadding }) {
  return (
    <div
      className={`w-full h-fit my-2 bg-slate-100 ${
        !disablePadding ? `p-3` : ``
      } shadow-md`}
    >
      {children}
    </div>
  );
}

export default RightSidebarCompWrapper;
