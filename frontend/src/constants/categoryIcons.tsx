import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

export const DEFAULT_CATEGORY_ICON = 'MoreHorizRounded';

export const CATEGORY_ICONS: Record<string, ComponentType<SvgIconProps>> = {
  RestaurantRounded: RestaurantRoundedIcon,
  ShoppingCartRounded: ShoppingCartRoundedIcon,
  DirectionsBusRounded: DirectionsBusRoundedIcon,
  HomeRounded: HomeRoundedIcon,
  SportsEsportsRounded: SportsEsportsRoundedIcon,
  BusinessCenterRounded: BusinessCenterRoundedIcon,
  SavingsRounded: SavingsRoundedIcon,
  LocalHospitalRounded: LocalHospitalRoundedIcon,
  SchoolRounded: SchoolRoundedIcon,
  CardGiftcardRounded: CardGiftcardRoundedIcon,
  PetsRounded: PetsRoundedIcon,
  FlightRounded: FlightRoundedIcon,
  AutorenewRounded: AutorenewRoundedIcon,
  FitnessCenterRounded: FitnessCenterRoundedIcon,
  LocalCafeRounded: LocalCafeRoundedIcon,
  [DEFAULT_CATEGORY_ICON]: MoreHorizRoundedIcon,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function getCategoryIconComponent(icon: string | null | undefined): ComponentType<SvgIconProps> {
  return (icon && CATEGORY_ICONS[icon]) || CATEGORY_ICONS[DEFAULT_CATEGORY_ICON];
}
