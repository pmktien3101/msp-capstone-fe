import { RiDashboardLine } from 'react-icons/ri';
import { BiFolder } from 'react-icons/bi';
import { MdOutlineMeetingRoom } from 'react-icons/md';
import { BsListTask } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';

export const sidebarLinks = [
  {
    label: 'Bảng Điều Khiển',
    route: '/dashboard',
    icon: RiDashboardLine
  },
  {
    label: 'Dự Án',
    route: '/projects',
    icon: BiFolder
  },
  {
    label: 'Cuộc Họp',
    route: '/meetings',
    icon: MdOutlineMeetingRoom
  },
  {
    label: 'Công Việc',
    route: '/tasks',
    icon: BsListTask
  },
  {
    label: 'Nhóm',
    route: '/teams',
    icon: HiOutlineUserGroup
  }
];