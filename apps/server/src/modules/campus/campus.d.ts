export type CampusItem = Awaited<
  ReturnType<import('./campus.service').CampusService['findOne']>
>

export type CampusList = Awaited<
  ReturnType<import('./campus.service').CampusService['paginate']>
>
