import {
  Text,
  Button,
  Flex,
  Box,
  Spacer,
  Stack,
  Select
} from '@chakra-ui/react';
import { gql, useQuery } from "@apollo/client";
import { prettyJSON } from '../lib/helpers';
import { BigNumber } from "@ethersproject/bignumber";

import { useProfileID, useDispatchProfileID } from "./context/AppContext";
import { useState, useEffect } from 'react';
import { UNSET_CONTEXT_PROFILE_ID } from '../lib/config';

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        location
        website
        twitterUrl
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        depatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          __typename
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

function SelectProfile({ address }) {
  const { profileIDApp } = useProfileID();
  const dispatch = useDispatchProfileID()

  // get profiles ownedBy connected address
  const { loading, error, data, fetchMore, called } = useQuery(
    gql(GET_PROFILES),
    {
      variables: {
        request: { ownedBy: address },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    });

  // set first profile to appcontext if no profile ID is set
  if (profileIDApp.eq(UNSET_CONTEXT_PROFILE_ID) && data?.profiles?.items?.length > 0) {
    let firstProfileID = BigNumber.from(data.profiles.items[0].id);
    dispatch({ type: 'set_profileID', payload: firstProfileID });
  }

  // handle select one of owned profileID
  function changeProfileID(event: any) {
    dispatch({ type: 'set_profileID', payload: BigNumber.from(event.target.value) });
  }

  if (data) {
    // prettyJSON('data', data)
    console.log(`found : ${data.profiles?.items?.length} profiles`)
    if (data.profiles?.items?.length < 1) {
      return (
        <>
          <Text>you do not own a profile</Text>
        </>
      )
    };
    return (
      <>
        <Stack spacing={3}>
          <Select onChange={(event) => changeProfileID(event)}>
            {
              data.profiles?.items.map((profile) => {
                let profileID = BigNumber.from(profile.id);
                return (
                  <option
                    key={profileID.toHexString()}
                    defaultValue={profileIDApp.toHexString()}
                    value={profileID.toHexString()} >
                    {profile.handle}{'#'}{profileID.toHexString()}
                  </option>)
              })
            }
          </Select>
        </Stack>
      </>
    )
  }
  else if (loading) {
    return (
      <>
        <Text>loading</Text>
      </>
    )
  }
  else {
    return (
      <>
      </>
    )
  }
}

export default SelectProfile;
