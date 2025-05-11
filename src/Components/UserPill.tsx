import { Link } from "react-router-dom";


const UserPill = ({ role, firstName, lastName }: { role: string, firstName: string, lastName: string }) => {
  return (
    <Link
      to={"/settings/profile"}
      className="flex items-center justify-center p-1 gap-1 w-max bg-primary border-[0.2px] border-[#A58730] rounded-[32px]"
      onClick={() => { }}
    >
      <div
        className="text-ascent w-[24px] h-[24px] border-[0.2px] border-ascent rounded-full uppercase"
      >
        {firstName.charAt(0) + lastName.charAt(0)}
      </div>
      <p className="px-2 py-1 bg-secondary text-xs text-buttonText font-medium rounded-full capitalize">
        {role}
      </p>
    </Link>
  );
};

export default UserPill;
