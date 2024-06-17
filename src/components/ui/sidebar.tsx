
const SideBar = ({title}: {title: string}) => {
  return (
    <div className="hover:bg-[#31363F] cursor-pointer p-4 rounded-xl flex justify-start">
      {title}
    </div>
  )
}

export default SideBar
